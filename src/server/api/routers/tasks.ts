import { unknown, z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { sql } from "drizzle-orm";
import postgres from '@vercel/postgres'
import db from "@/server/db";
import { inferAsyncReturnType } from "@trpc/server";
import { ResultBuilder } from "pg";
import { FullQueryResults, QueryResult } from "@neondatabase/serverless";


import { Category } from "@/types/types";












export const taskRouter = createTRPCRouter({
    getCategorizedTasks: protectedProcedure.query(async () => {

      
      const sqlCommand = sql`SELECT
      c.id AS categoryId,
      c.title AS categoryName,
      c.description AS categoryDescription,
      c.priority AS categoryPriority,
      c.labels AS categoryLabels,
      c.remark AS categoryRemark,
      c.created_on AS categoryCreatedOn,
      jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'categoryId', t.category_id,
          'title', t.title,
          'description', t.description,
          'status', t.status,
          'priority', t.priority,
          'locked', t.locked,
          'flexible', t.flexible,
          'priorityLabel', t.priority_label,
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
                  'taskId', st.task_id,
                  'title', st.title,
                  'description', st.description,
                  'status', st.status,
                  'priority', st.priority,
                  'locked', st.locked,
                  'flexible', st.flexible,
                  'priorityLabel', st.priority_label,
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
        ) ORDER BY t.view_as ASC, t.created_on DESC, t.priority DESC
      ) AS tasks
    FROM
      categories c
    JOIN
      tasks t ON c.id = t.category_id
    GROUP BY
      c.id, c.title, c.description, c.priority, c.labels, c.remark, c.created_on
    ORDER BY
      c.priority;       
    `


    const res6 = await db.query.categories.findMany({
      with: {
        
      }
    })
    const startTime = performance.now()
    const res = await db.execute(sqlCommand)
    const endTime = performance.now()
    const elapsedTime = endTime - startTime;
    console.log(elapsedTime, 'in ms')
    const resr: Category[] = res.rows as unknown as Category[]
    console.log('resr is ', resr[0]?.tasks[0])
    return resr as Category[]        
})
})


// SELECT
//       c.id AS categoryId,
//       c.title AS categoryName,
//       c.description AS categoryDescription,
//       c.priority AS categoryPriority,
//       c.labels AS categoryLabels,
//       c.remark AS categoryRemark,
//       c.created_on AS categoryCreatedOn,
//       jsonb_agg(
//         jsonb_build_object(
//           'id', t.id,
//           'categoryId', t.category_id,
//           'title', t.title,
//           'description', t.description,
//           'status', t.status,
//           'priority', t.priority,
//           'locked', t.locked,
//           'flexible', t.flexible,
//           'priorityLabel', t.priority_label,
//           'createdOn', t.created_on,
//           'expiresOn', t.expires_on,
//           'completedOn', t.completed_on,
//           'viewAs', t.view_as,
//           'specialLabels', t.special_labels,
//           'remark', t.remark,
//           'subtasks', COALESCE(subtasks.jsonb_agg, '[]'::jsonb),
//           'tracker', COALESCE(trackers.jsonb_agg, '[]'::jsonb)
//         ) ORDER BY t.view_as ASC, t.created_on DESC, t.priority DESC
//       ) AS tasks
//     FROM
//       categories c
//     JOIN
//       tasks t ON c.id = t.category_id
//     LEFT JOIN LATERAL (
//       SELECT
//         jsonb_agg(
//           jsonb_build_object(
//             'id', st.id,
//             'taskId', st.task_id,
//             'title', st.title,
//             'description', st.description,
//             'status', st.status,
//             'priority', st.priority,
//             'locked', st.locked,
//             'flexible', st.flexible,
//             'priorityLabel', st.priority_label,
//             'createdOn', st.created_on,
//             'expiresOn', st.expires_on,
//             'completedOn', st.completed_on,
//             'viewAs', st.view_as,
//             'specialLabels', st.special_labels,
//             'remark', st.remark,
//             'tracker', COALESCE(trackers.jsonb_agg, '[]'::jsonb)
//           )
//         )
//       FROM
//         subtasks st
//       LEFT JOIN LATERAL (
//         SELECT
//           jsonb_agg(
//             jsonb_build_object(
//               'id', tr.id,
//               'title', tr.title,
//               'frequency', tr.frequency,
//               'createdOn', tr.created_on
//             )
//           )
//         FROM
//           trackers tr
//         WHERE
//           tr.task_id = st.id AND tr.tracked
//       ) AS trackers ON true
//       WHERE
//         st.task_id = t.id
//     ) AS subtasks ON true
//     LEFT JOIN LATERAL (
//       SELECT
//         jsonb_agg(
//           jsonb_build_object(
//             'id', tr.id,
//             'title', tr.title,
//             'frequency', tr.frequency,
//             'createdOn', tr.created_on
//           )
//         )
//       FROM
//         trackers tr
//       WHERE
//         tr.task_id = t.id AND tr.tracked
//     ) AS trackers ON true
//     GROUP BY
//       c.id, c.title, c.description, c.priority, c.labels, c.remark, c.created_on
//     ORDER BY
//       c.priority;