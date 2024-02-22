"use server";

import { formdata } from "@/components/tasks/AddNewForm";
import { authOptions } from "@/server/auth";
import db from "@/server/db";
import { db as dbForTransaction } from "@/server/db/pool";
import { categories, tasks } from "@/server/db/schema";
import { CategoryType } from "@/types/types";
import { InferInsertModel, InferSelectModel, and, eq, sql } from "drizzle-orm";
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
        errorMessage?: any;
        authorizationError?: boolean;
      };
    }
  | {
      data?: {
        insertedCategory?: InferInsertModel<typeof categories>;
        insertedTask?: InferInsertModel<typeof tasks>;
      };
    };

export async function createNewTask(values: formdata) {
  try {
    await db.select();

    console.log("Here");
    console.log(performance.now());
    const categoriesWithTasksAndSubtasks = await db.execute(sql`SELECT
    c.id AS categoryId,
    c.title AS categoryName,
    c.description as categoryDescription,
    c.priority AS categoryPriority,
    c.labels AS categoryLabels,
    c.remark AS categoryRemark,
    c.created_on AS categoryCreatedOn,
    jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'title', t.title,
        'description', t.description,
        'status', t.status,
        'priority', t.priority,
        'locked', t.locked,
        'flexible', t.flexible,
        'priorityLabel',t.priority_label,
        'createdOn', t.created_on,
        'expiresOn', t.expires_on,
        'completedOn', t.completed_on,
        'viewAs', t.view_as,
        'specialLabels', t.special_labels,
        'remark', t.remark,
        'subtasks', (
          SELECT
            jsonb_agg(
              jsonb_build_object(
          'id', st.id,
          'title', st.title,
          'description', st.description,
          'status', st.status,
          'priority', st.priority,
          'locked', st.locked,
          'flexible', st.flexible,
          'priorityLabel',st.priority_label,
          'createdOn', st.created_on,
          'expiresOn', st.expires_on,
          'completedOn', st.completed_on,
          'viewAs', st.view_as,
          'specialLabels', st.special_labels,
          'remark', st.remark,
          'tracker', (
            SELECT
            jsonb_agg(
              jsonb_build_object(
                'id', tr.id,
                'title', tr.title,
                'frequency', tr.frequency,
                'createdOn', tr.created_on
              )
            )
            FROM
              trackers tr
            WHERE
              tr.task_id = st.id
          )
              )
            )
          FROM
            subtasks st
          WHERE
            st.task_id = t.id
        ),
        'tracker', (
          SELECT
          jsonb_agg(
            jsonb_build_object(
              'id', tr.id,
              'title', tr.title,
              'frequency', tr.frequency,
              'createdOn', tr.created_on
            )
          )
          FROM
            trackers tr
          WHERE
            tr.task_id = t.id AND tr.tracked
        )
      )
    ) AS tasks
  FROM
    categories c
  JOIN
    tasks t ON c.id = t.category_id
  GROUP BY
    c.id, c.title
  ORDER BY
    c.priority;
  `);
    console.log(performance.now());

    // const [categoriesWithTasksAndSubtasks2] = await db.select({
    //   categoryId: categories.id,
    //   categoryName: categories.title,
    //   tasks: db.select().from(tasks).where(
    //     eq(tasks.categoryId, categories.id)
    //   )
    // }).from(categories)
    // .innerJoin(tasks, eq(categories.id, tasks.categoryId))
    // .groupBy(categories.id, categories.title)
    // .orderBy(categories.title).execute();

    // const categoriesWithTasksAndSubtasks = await db.query.categories.findMany({
    //   with: {
    //     tasks: true
    //   }
    // })
    // if (categoriesWithTasksAndSubtasks === undefined) {
    //   console.log('Undefined')
    //   return {Hey: 'okdone'}
    // }
    console.log("Awaited data is ", categoriesWithTasksAndSubtasks.rows);

    return categoriesWithTasksAndSubtasks.rows;
  } catch (e) {
    console.log("Error is ", e);
    return { Hey: "Error" };
  }
}

// export async function createNewTask(values: formdata) {
//   console.log("createNewTask Server component processing");
//   console.log(values);
//   const session = await getServerSession(authOptions);

//   const abc = await db.query.categories
//   if (!session) {
//     const response:response = {
//       error: {authorizationError: true}
//     }
//     return response
//   }
//   console.log("We are here");

//   let actionResponse: response;
//   let data: {
//     insertedCategory?: InferInsertModel<typeof categories>;
//     insertedTask?: InferInsertModel<typeof tasks>;
//   } = {};
//   try {
//     const dbResponse = await dbForTransaction.transaction(async (tx) => {
//       let skipCategoryGeneration = false;
//       const result = await tx
//         .select()
//         .from(categories)
//         .where(
//           and(
//             eq(categories.userId, session.user.id),
//             eq(categories.title, values.category),
//           ),
//         );
//       if (result.length > 0) {
//         actionResponse = { error: { categoryNameConflict: true } };
//         console.log("response is: ", actionResponse);
//         skipCategoryGeneration = true;
//         data.insertedCategory = result[0];
//       }
//       console.log("1st step completed without error");

//       if (skipCategoryGeneration === false) {
//         const [insertedCategory] = await tx
//           .insert(categories)
//           .values({
//             userId: session.user.id,
//             title: values.category,
//             priority: priorityNumberMap["Moderate"].toString(),
//           })
//           .returning();

//         if (!insertedCategory) {
//           actionResponse = {
//             error: {
//               categoryDbError: true,
//             },
//           };
//           console.log("response is: ", actionResponse);
//           return actionResponse;
//         }
//         data.insertedCategory = insertedCategory;
//       }

//       console.log("2nd step completed without error");

//       if (data?.insertedCategory?.id) {
//         const result = await tx
//           .select()
//           .from(tasks)
//           .where(
//             and(
//               eq(tasks.categoryId, data?.insertedCategory?.id),
//               eq(tasks.title, values.title),
//             ),
//           );
//         if (result.length > 0) {
//           actionResponse = { error: { taskNameConflict: true } };
//           console.log("response is: ", actionResponse);
//           console.log("Further process stopped");
//           return actionResponse;
//         }

//         console.log("3rd step completed without error");

//         const [insertedTask] = await tx
//           .insert(tasks)
//           .values({
//             categoryId: data?.insertedCategory?.id,
//             title: values.title,
//             description: values.description,
//             priority: (
//               priorityNumberMap["Moderate"] + statusMap["Not Started"]
//             ).toString(),
//             status: "Not Started",
//             viewAs: "Status",
//           })
//           .returning();

//         if (!insertedTask) {
//           actionResponse = { error: { taskDbError: true } };
//           console.log("response is: ", actionResponse);
//           console.log("further step aborted");
//           return actionResponse;
//         }

//         data.insertedTask = insertedTask;
//       }
//       console.log("4rth step completed without error");

//       actionResponse = {
//         data: {
//           insertedCategory: data.insertedCategory,
//           insertedTask: data.insertedTask,
//         },
//       };
//       console.log("response is: ", actionResponse);
//       return actionResponse;
//     });
//     return dbResponse;
//   } catch (err) {
//     console.log("Error is: ", err);
//     actionResponse = {
//       error: {
//         errorMessage: err,
//       },
//     };
//     return actionResponse;
//   }
// }
