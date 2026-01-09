"use server";

import { endOfDay, startOfDay } from "date-fns";
import { and, eq, inArray } from "drizzle-orm";
import { ZodError, z } from "zod";

import { getServerAuthSession } from "@/server/auth";
import db from "@/server/db";
import {
  categories,
  tasks,
  tasksToTrackers,
  trackerStatus,
  trackers,
} from "@/server/db/schema";

import { FormSchemaCreateNewTracker } from "@/shared/tracker";
import { revalidateTagsAction } from "./utils";

const MODERATE_TASK_PRIORITY_VALUE = 60;

type formdataCreateNewTracker = z.infer<typeof FormSchemaCreateNewTracker>;

const getDefaultCategoryId = async (userId: string, tx = db) => {
  const existing = await tx.query.categories.findFirst({
    where: (categories, { and, eq }) =>
      and(eq(categories.userId, userId), eq(categories.title, "GENERAL")),
  });

  if (existing?.id) return existing.id;

  const [insertedCategory] = await tx
    .insert(categories)
    .values({
      title: "GENERAL",
      userId,
    })
    .returning({ id: categories.id });

  if (!insertedCategory) {
    throw new Error("Failed to create default category for user.");
  }

  return insertedCategory.id;
};

const computeTrackerStatus = (startOn: Date) => {
  const todayStart = startOfDay(new Date());
  return startOn > todayStart ? "Not Started Yet" : "In Progress";
};

const sanitizeTaskIds = (ids: string[] = []) => Array.from(new Set(ids));

export async function createNewTracker(values: formdataCreateNewTracker) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return {
        error: "Not authenticated.",
      };
    }

    const input = FormSchemaCreateNewTracker.parse(values);
    const userId = session.user.id;

    await db.transaction(async (tx) => {
      const status = computeTrackerStatus(input.range.from);

      const [createdTracker] = await tx
        .insert(trackers)
        .values({
          title: input.title,
          description: input.description,
          frequency: input.frequency,
          status,
          userId,
          startOn: input.range.from,
          endOn: input.range.to,
          remark: input.remark,
        })
        .returning({ id: trackers.id });

      if (!createdTracker) {
        throw new Error("Unable to create tracker.");
      }

      const taskIdsToLink: string[] = [];

      // Optionally create a new task and link
      if (input.newTaskTitle) {
        const categoryId = await getDefaultCategoryId(userId, tx);
        const taskStatus = input.range.from > new Date() ? "Scheduled" : "Not Started";
        const [addedTask] = await tx
          .insert(tasks)
          .values({
            categoryId,
            expiresOn: endOfDay(input.range.to),
            effectiveOn: input.range.from,
            title: input.newTaskTitle.trim(),
            user_order: String(MODERATE_TASK_PRIORITY_VALUE),
            userId,
            status: taskStatus,
            priorityLabel: "Moderate",
          })
          .returning({ id: tasks.id });

        if (!addedTask) {
          throw new Error("Unable to create task for tracker.");
        }

        taskIdsToLink.push(addedTask.id);
      }

      // Link existing tasks
      if (input.existingTaskIds?.length) {
        const uniqueTaskIds = sanitizeTaskIds(input.existingTaskIds);
        const validTasks = await tx
          .select({ id: tasks.id })
          .from(tasks)
          .where(
            and(eq(tasks.userId, userId), inArray(tasks.id, uniqueTaskIds)),
          );

        taskIdsToLink.push(...validTasks.map((task) => task.id));
      }

      if (taskIdsToLink.length) {
        await tx.insert(tasksToTrackers).values(
          taskIdsToLink.map((taskId) => ({
            taskId,
            trackerId: createdTracker.id,
          })),
        );
      }
    });

    await revalidateTagsAction([
      "cached-tracker-data",
      `tracker-list-${session.user.id}`,
      `all-tasks-${session.user.id}`,
    ]);

    return {
      success: "Tracker saved.",
    };
  } catch (e) {
    console.log("Tracker error: ", e);
    if (e instanceof ZodError) {
      return {
        error: "Validation Error",
      };
    }
    return {
      error: "Server Error",
    };
  }
}

export async function updateTrackerStatus(
  trackerId: string,
  nextStatus: (typeof trackerStatus.enumValues)[number],
) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return { error: "Not authenticated." };
    }

    const userId = session.user.id;

    await db
      .update(trackers)
      .set({ status: nextStatus })
      .where(and(eq(trackers.id, trackerId), eq(trackers.userId, userId)));

    await revalidateTagsAction([
      "cached-tracker-data",
      `tracker-list-${userId}`,
      `all-tasks-${userId}`,
    ]);

    return { success: "Tracker updated." };
  } catch (e) {
    console.log("Tracker status error: ", e);
    return { error: "Server Error" };
  }
}

export async function replaceTrackerTasks(
  trackerId: string,
  taskIds: string[],
) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return { error: "Not authenticated." };
    }

    const userId = session.user.id;
    const uniqueTaskIds = sanitizeTaskIds(taskIds);

    await db.transaction(async (tx) => {
      const tracker = await tx.query.trackers.findFirst({
        where: (tracker, { and, eq }) =>
          and(eq(tracker.id, trackerId), eq(tracker.userId, userId)),
        columns: { id: true },
      });

      if (!tracker) {
        throw new Error("Tracker not found.");
      }

      const validTasks = await tx
        .select({ id: tasks.id })
        .from(tasks)
        .where(and(eq(tasks.userId, userId), inArray(tasks.id, uniqueTaskIds)));

      await tx
        .delete(tasksToTrackers)
        .where(eq(tasksToTrackers.trackerId, trackerId));

      if (validTasks.length) {
        await tx.insert(tasksToTrackers).values(
          validTasks.map((task) => ({
            taskId: task.id,
            trackerId,
          })),
        );
      }
    });

    await revalidateTagsAction([
      "cached-tracker-data",
      `tracker-list-${userId}`,
      `all-tasks-${userId}`,
    ]);

    return { success: "Tracker tasks refreshed." };
  } catch (e) {
    console.log("Replace tracker tasks error: ", e);
    return { error: "Server Error" };
  }
}
