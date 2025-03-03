"use server";

const logDev = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
};

import { getEndOfDay, getEndOfDayISOString } from "@/lib/utils";
import { authOptions, getServerAuthSession } from "@/server/auth";
import db from "@/server/db";
import { db as dbForTransaction } from "@/server/db/pool";
import {
  categories,
  events,
  rangeEvents,
  singleDayEvents,
  subtasks,
  tasks,
} from "@/server/db/schema";

import { getServerSession } from "next-auth";

const priorityNumberMap = {
  "Very High": 50,
  High: 40,
  Moderate: 30,
  Less: 20,
  "Very Less": 10,
};

const statusMap = {
  Scheduled: 20,
  Paused: 40,
  Progress: 50,
  "Not Started": 30,
  Finished: 10,
};

type response =
  | {
      error?: {
        categoryNameConflict?: boolean;
        taskNameConflict?: boolean;
        categoryDbError?: boolean;
        taskDbError?: boolean;
        unExpectedErro?: boolean;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        errorMessage?: any;
        authorizationError?: boolean;
      };
    }
  | {
      data?: {
        insertedCategory?: InferInsertModel<typeof categories>;
        insertedTask?: InferInsertModel<typeof tasks>;
        insertedSubtask?: InferInsertModel<typeof subtasks>;
      };
    };

export async function createNewTask(
  values: z.infer<typeof formSchemaAddNewTask>,
) {
  try {
    logDev("In CreateNewTask");
    logDev("Got:", values);

    //Check auth
    const session = await getServerSession(authOptions);
    if (!session) {
      return {
        error: "Unauthorized",
      };
    }

    // Validate Data(types)
    formSchemaAddNewTask.parse(values);

    //Validate Data(Logical Constraints and Validity check)

    //Get or create new category
    
      let category = await db.query.categories.findFirst({
        where: and(
          eq(categories.title, values.category),
          eq(categories.userId, session.user.id),
        ),
        columns: {
          id: true,
        },
      });
      if (!category) {
        const categoryInsertValue: InferInsertModel<typeof categories> = {
          title: values.category,
          userId: session.user.id,
        };
        const [insert] = await db
          .insert(categories)
          .values(categoryInsertValue)
          .returning({ id: categories.id });
        if (!insert) {
          return {
            error: "Server Error",
          };
        }
        category = insert;
      }

    // Can't create new 
    const insertValueTask: InferInsertModel<typeof tasks> = {
      userId: session.user.id,
      title: values.title,
      categoryId: category.id,
      expiresOn: values.expiresOn,
      viewAs: values.viewAs,
      priorityLabel: values.priority,
    }
    if (values.scheduledOn) insertValueTask['effectiveOn'] = values.scheduledOn
    if (values.description) insertValueTask['description'] = values.description
    if (values.remark) insertValueTask['remark'] = values.remark
    await db.insert(tasks).values(insertValueTask)
    revalidateTag(`all-tasks-${session.user.id}`);
    return {
      data: `Successfully created ${values.title}`
    }

  } catch (e) {
    logDev(e);
    if (e instanceof ZodError) {
      return {
        error: "Bad Request, Validation Failed.",
      };
    }
    return {
      error: "Server Error Encountered.",
    };
  }
}

export async function createNewSubtask(
  values: z.infer<typeof formSchemaAddNewTask>,
  taskId: string,
) {
  try {
    logDev("In CreateNewTask");
    logDev("Got:", values);

    //Check auth
    const session = await getServerSession(authOptions);
    if (!session) {
      return {
        error: "Unauthorized",
      };
    }

    // Validate Data(types)
    z.string().parse(taskId);
    formSchemaAddNewTask.parse(values);


    // Check if the taskId is valid
    const task = await db.query.tasks.findFirst({
      where: and(
        eq(tasks.id, taskId),
        eq(tasks.userId, session.user.id),
      ),
      columns: {
        id: true,
      },
    });
    if (!task) {
      return {
        error: "Parent task not found",
      };
    }

    //Validate Data(Logical Constraints and Validity check)

    //Get or create new category
    
      let category = await db.query.categories.findFirst({
        where: and(
          eq(categories.title, values.category),
          eq(categories.userId, session.user.id),
        ),
        columns: {
          id: true,
        },
      });
      if (!category) {
        const categoryInsertValue: InferInsertModel<typeof categories> = {
          title: values.category,
          userId: session.user.id,
        };
        const [insert] = await db
          .insert(categories)
          .values(categoryInsertValue)
          .returning({ id: categories.id });
        if (!insert) {
          return {
            error: "Server Error",
          };
        }
        category = insert;
      }

    // Can't create new 
    const insertValueTask: InferInsertModel<typeof tasks> = {
      parentId: taskId,
      userId: session.user.id,
      title: values.title,
      categoryId: category.id,
      expiresOn: values.expiresOn,
      viewAs: values.viewAs,
      priorityLabel: values.priority,
    }
    if (values.scheduledOn) insertValueTask['effectiveOn'] = values.scheduledOn
    if (values.description) insertValueTask['description'] = values.description
    if (values.remark) insertValueTask['remark'] = values.remark
    await db.insert(tasks).values(insertValueTask)
    revalidatePath(`/tasks2`);
    // revalidateTag(`all-tasks-${session.user.id}`);
    return {
      data: `Successfully created ${values.title}`
    }

  } catch (e) {
    logDev(e);
    if (e instanceof ZodError) {
      return {
        error: "Bad Request, Validation Failed.",
      };
    }
    return {
      error: "Server Error Encountered.",
    };
  }
}

export interface EditTaskResponse {
  data?: InferSelectModel<typeof tasks>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
}

export async function EditTaskAction(values: ExtendedFormValues) {
  console.log("createNewTask Server component processing");
  console.log(values);
  const {
    title,
    priority,
    status,
    remark,
    viewAs,
    category,
    description,
    taskId,
    locked,
  } = values;
  const session = await getServerSession(authOptions);
  if (!session) {
    const response: response = {
      error: { authorizationError: true },
    };
    return response;
  }
  console.log("We are here");
  const responseInitializer: EditTaskResponse = {};

  try {
    // type TaskSelectResult = [InferSelectModel<typeof tasks>];
    const [transactionResult] = await dbForTransaction.transaction(
      async (tx) => {
        const [categoryResult] = await db
          .select({
            categoryId: categories.id,
          })
          .from(categories)
          .where(ilike(categories.title, category))
          .limit(1);
        console.log("cateegory result is ", categoryResult);
        //see if it is locked or expired or new expiry is valid
        await tx
          .update(tasks)
          .set({
            categoryId: categoryResult?.categoryId,
            title: title,
            status: status,
            description: description,
            priorityLabel: priority,
            viewAs: viewAs,
            remark: remark,
            locked: locked,
          })
          .where(eq(tasks.id, taskId));
        console.log("task id is ", taskId);

        const updatedTask = await tx
          .select()
          .from(tasks)
          .where(eq(tasks.id, taskId));

        console.log("updatedTask task result is ", updatedTask);
        return updatedTask;
      },
    );
    responseInitializer.data = transactionResult;
    return responseInitializer;
  } catch (error) {
    console.log("EDIT_TASK", error);
    responseInitializer.error = JSON.stringify(error);
    return responseInitializer;
  }
}

import type { formdataEvent } from "@/components/events/AddNewEvent";
import { formSchema } from "@/components/events/AddNewEvent";
import { z, ZodError } from "zod";
import {
  type InferInsertModel,
  type InferSelectModel,
  and,
  eq,
  ilike,
} from "drizzle-orm";
// import type { formdata } from "@/components/tasks/AddNewForm";
import type { ExtendedFormValues, TaskStatus, TaskType } from "@/types/types";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidateTagsAction } from "@/actions/utils";
import { getErrorMessage } from "@/utils/misc";
import { redirect } from "next/navigation";
import { formSchemaAddNewTask } from "./schemas";

export async function createEventAction(values: formdataEvent) {
  //Authenticate user
  const session = await getServerAuthSession();
  if (!session) {
    // User not authenticated
    return {
      error: "USER_NOT_AUTHENTICATED_CREATEEVENT",
    };
  }

  // User authentication completed

  // Request data validation
  try {
    formSchema.parse(values);
    // If validation succeeds, continue processing with validatedData
  } catch (error) {
    if (error instanceof ZodError) {
      // Handle validation error, e.g., send an error response
      return {
        error: "Validation failed",
        details: error.errors.toString(),
        status: 400,
      };
    }
    // } else {
    //   // Handle other errors
    //   return { error: "Internal server error", status: 500, errorDetails: error };
    // }
  }
  //Data validation completed

  const tags = values.tags.split(",");

  // database works
  try {
    await db.query.events.findFirst({
      where: and(
        eq(events.userId, session.user.id),
        eq(events.title, values.title),
      ),
    });
  } catch (error) {
    return {
      error: "DB_QUERY_ERROR_FINDFIRST",
      errorDetails: error,
    };
  }

  if (values.type === "single") {
    if (!values.EventTimeStamp) {
      return {
        error: "NO_EVENT_TIMESTAMP",
      };
    }
    const EventTimeStamp = values.EventTimeStamp;
    const result = await dbForTransaction.transaction(async (tx) => {
      const [createdEvent] = await tx
        .insert(events)
        .values({
          userId: session.user.id,
          eventNature: "Single",
          tags: tags,
          title: values.title,
          description: values.description,
        })
        .returning();

      if (!createdEvent?.id) {
        tx.rollback();
        return;
      }

      const [createdSingleEvent] = await tx
        .insert(singleDayEvents)
        .values({
          eventId: createdEvent.id,
          eventDate: EventTimeStamp,
        })
        .returning();

      return {
        data: { ...createdEvent, ...createdSingleEvent },
      };
    });
    return result;
  }

  if (values.type === "range") {
    if (!values.range?.from && !values.range?.to) {
      return {
        error: "NO_EVENT_RANGE_TIMESTAMP",
      };
    }
    // const range = `[${values.range.from.toISOString()}, ${values.range.to.toISOString()}]`
    const startDate = values.range.from;
    const endDate = values.range.to;
    const result = await dbForTransaction.transaction(async (tx) => {
      const [createdEvent] = await tx
        .insert(events)
        .values({
          userId: session.user.id,
          eventNature: "Range",
          tags: tags,
          title: values.title,
          description: values.description,
        })
        .returning();

      if (!createdEvent?.id) {
        tx.rollback();
        return;
      }

      const [createdRangeEvent] = await tx
        .insert(rangeEvents)
        .values({
          startDate: startDate,
          endDate: endDate,
          eventId: createdEvent.id,
        })
        .returning();

      return {
        data: { ...createdEvent, ...createdRangeEvent },
      };
    });
    return result;
  }
}

enum InputType {
  "task",
  "subtask",
}

export async function updateStatus(
  taskId: string,
  statusStr: TaskStatus,
  type: TaskType,
) {
  const session = await getServerAuthSession();
  if (!session) {
    throw new Error("Unauthorized.");
  }
  const userId = session.user.id;
  if (type === "tasks") {
    try {
      await db.transaction(async (tx) => {
        const res = await db.query.tasks.findFirst({
          where: eq(tasks.id, taskId),
        });
        if (!res || res.expiresOn < new Date()) {
          if (statusStr !== "Expired") {
            console.log(
              "Changing status to expired due to expiry limit already breached.",
            );
            statusStr = "Expired";
          }
        }
        await tx
          .update(tasks)
          .set({
            status: statusStr,
          })
          .where(eq(tasks.id, taskId));
      });
    } catch (e) {
      return {
        error: `Error Occurred while updating status : ${getErrorMessage(e)}`,
      };
    }
    revalidateTag(`all-tasks-${userId}`);
    return {
      success: `Updated ${type} status to ${statusStr}`,
    };
  }
  if (type === "subtasks") {
    try {
      await db.transaction(async (tx) => {
        const res = await db.query.subtasks.findFirst({
          where: eq(subtasks.id, taskId),
        });
        if (!res || (res.expiresOn && res.expiresOn < new Date())) {
          if (statusStr !== "Expired") {
            console.log(
              "Changing status to expired due to expiry limit already breached.",
            );
            statusStr = "Expired";
          }
        }
        await tx
          .update(subtasks)
          .set({
            status: statusStr,
          })
          .where(eq(subtasks.id, taskId));
      });
    } catch (e) {
      return {
        error: `Error Occurred while updating status : ${e}`,
      };
    }
    await revalidateTagsAction(["all-tasks"]);
    return {
      success: `Updated ${type} status to ${statusStr}`,
    };
  }
}

export async function deleteFunctionality(taskId: string, type: TaskType) {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/api/auth/signin");
  }
  const userId = session.user.id;
  if (type === "tasks") {
    try {
      await db.transaction(async (tx) => {
        await tx.delete(tasks).where(eq(tasks.id, taskId));
      });
    } catch (e) {
      return {
        error: `Error Occurred while updating status : ${getErrorMessage(e)}`,
      };
    }
    revalidateTag(`all-tasks-${userId}`);

    return {
      success: `Deleted ${type} ${taskId}.`,
    };
  }
  if (type === "subtasks") {
    try {
      await db.transaction(async (tx) => {
        await tx.delete(subtasks).where(eq(subtasks.id, taskId));
      });
    } catch (e) {
      return {
        error: `Error Occurred while updating status : ${e}`,
      };
    }
    await revalidateTagsAction(["all-tasks"]);
    return {
      success: `Deleted ${type} ${taskId}.`,
    };
  }
}
