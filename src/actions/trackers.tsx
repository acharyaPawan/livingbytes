"use server"

import { FormSchemaCreateNewTracker } from "./../shared/tracker"
import { getServerAuthSession } from "@/server/auth"
import db from "@/server/db"
import { categories, tasks, tasksToTrackers, trackers } from "@/server/db/schema"
import { endOfToday, startOfToday } from "date-fns"

import { ZodError, z } from "zod"
import { revalidateTagsAction } from "./utils"
import { PRIORITYENUM } from "@/app/constants"

// function getEndOfToday() {
//   const today = new Date();
//   return new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
// }

const MODERATE_TASK_PRIORITY_VALUE: number = 60


type formdataCreateNewTracker = z.infer<
typeof FormSchemaCreateNewTracker
>;


export async function createNewTracker(values: formdataCreateNewTracker) {
  try {
    const session = await getServerAuthSession()
    if (!session) {
      return {
        error: "Not authenticated."
      }
    }
    // let validationResult: formdataCreateNewTracker
    const validationResult = FormSchemaCreateNewTracker.parse(values)
    // let insertValues: typeof trackers.$inferInsert
    // insertValues = {
    //   title: validationResult.title,
    //   frequency: validationResult.frequency,
    //   startOn: validationResult.range.from,
    //   endOn: validationResult.range.to,
    //   userId: session.user.id,
    //   remark: validationResult.remark,
    //   // followUpDate: validationResult.range.from
    // }

    await db.transaction(async (tx) => {
      console.log("Here")
      if (validationResult.taskIdEff === "Reference Already Existing One") {
        const res = await tx.query.tasks.findFirst({
          where: (tasks, {and, eq, ne, lte}) =>  and(eq(tasks.id, validationResult.taskId ?? ""), ne(tasks.status, "Expired"), lte(tasks.expiresOn,  endOfToday()))
        })
        if (!res) {
          throw new Error("Referenced task not found.");
        }
        throw new Error("Under development.");
        // if res.status !== "Expired" && tasks.expiresOn 
      }

      let categoryId = await tx.query.categories.findFirst({
        where: (categories, {and, eq}) => and(eq(categories.userId, session.user.id), eq(categories.title, "GENERAL"))
      }).then((res) => res?.id)

      if (!categoryId) {
      const [insertedCategory] = await tx.insert(categories).values({
        'title': 'GENERAL', 
        'userId': session.user.id,
      }).returning({
        id: categories.id
      })

      if (!insertedCategory) {
        throw new Error("DBERROR: Insert operation for default category failed.");
      }
      categoryId = insertedCategory.id;
    }

      if (validationResult.taskIdEff === "Create New And Track") {
        const [addedTask] = await tx.insert(tasks).values({
          categoryId: categoryId,
          expiresOn: endOfToday(),
          title: validationResult.taskTitle ?? "",
          user_order: String(MODERATE_TASK_PRIORITY_VALUE),
          userId: session.user.id,
        }).returning({
          id: tasks.id
        })
        if (!addedTask) {
          throw new Error("Can't add task.")
        }

        const [addedTracker] = await tx.insert(trackers).values({
          // followUpDate: startOfToday(),
          title: validationResult.title ?? "",
          userId: session.user.id,
          frequency: validationResult.frequency,
          startOn: validationResult.range.from,
          remark: validationResult.remark,
          endOn: validationResult.range.to
        }).returning({
          id: trackers.id
        })

        if (!addedTracker) {
          throw new Error("Can't add tracker.")
        }

        const [res] = await tx.insert(tasksToTrackers).values(
          {
            taskId: addedTask.id,
            trackerId: addedTracker.id
          }
        ).returning()

        if (!res) {
          throw new Error("Can't create mapping.")
        }
      }
    });

    await revalidateTagsAction(["all-tasks", "cached-tracker-data", `all-tasks-${session.user.id}`])

    return {
      success: "yep"
    }
  } catch (e) {
    console.log("Tracker error: ", e)
    if (e instanceof ZodError) {
      return {
        error: "Validation Error"
      }
    }
    return {
      error: "Server Error"
    }
  }
}