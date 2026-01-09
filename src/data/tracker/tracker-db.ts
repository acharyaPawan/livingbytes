"server-only";

import { unstable_cache } from "next/cache";

import db from "@/server/db";

export const getCachedTrackers = (userId: string) =>
  unstable_cache(
    async (userId: string) => {
      const rows = await db.query.trackers.findMany({
        where: (tracker, { eq }) => eq(tracker.userId, userId),
        columns: {
          id: true,
          title: true,
          description: true,
          frequency: true,
          status: true,
          archived: true,
          locked: true,
          remark: true,
          startOn: true,
          endOn: true,
          createdOn: true,
        },
        orderBy: (tracker, { desc }) => desc(tracker.createdOn),
        with: {
          tasks: {
            columns: {},
            with: {
              task: {
                columns: {
                  id: true,
                  title: true,
                  status: true,
                  expiresOn: true,
                  effectiveOn: true,
                  priorityLabel: true,
                  viewAs: true,
                },
                with: {
                  category: {
                    columns: {
                      id: true,
                      title: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return rows.map((tracker) => ({
        ...tracker,
        tasks: tracker.tasks
          .map((link) => link.task)
          .filter(Boolean)
          .map((task) => ({
            ...task,
            categoryTitle: task?.category?.title ?? "Uncategorized",
          })),
      }));
    },
    [],
    { tags: ["cached-tracker-data", `tracker-list-${userId}`] },
  )(userId);

export const getCachedTaskOptionsForTrackers = (userId: string) =>
  unstable_cache(
    async (userId: string) => {
      return db.query.tasks.findMany({
        where: (task, { eq }) => eq(task.userId, userId),
        columns: {
          id: true,
          title: true,
          status: true,
          expiresOn: true,
          effectiveOn: true,
          priorityLabel: true,
        },
        orderBy: (task, { asc }) => [asc(task.expiresOn)],
        with: {
          category: {
            columns: {
              id: true,
              title: true,
            },
          },
        },
      });
    },
    [],
    { tags: [`all-tasks-${userId}`] },
  )(userId);

export type TrackerWithTasks = Awaited<ReturnType<typeof getCachedTrackers>>;
