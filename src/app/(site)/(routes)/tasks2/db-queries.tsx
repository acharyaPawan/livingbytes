import db from "@/server/db";
import { tasks } from "@/server/db/schema";
import { and, isNull, lt } from "drizzle-orm";

const data = await db.query.categories.findMany({
  columns: {
    id: true,
    title: true,
    priority: true,
  },
  with: {
    tasks: {
      columns: {
        id: true,
        createdOn: true,
        expiresOn: true,
        title: true,
        description: true,
        locked: true,
        status: true,
        viewAs: true,
        priority: true,
        priorityLabel:true,
        remark: true,
      },
      with: {
        subtasks: {
          columns: {
            title: true,
          },
        },
        trackersTasksMap: {
          columns: {},
          with: {
            tracker: {
              columns: {
                title: true,
              },
            },
          },
        },
      },
      where: and(isNull(tasks.completedOn), lt(tasks.expiresOn, new Date())),
      orderBy: (tasks, { desc, asc }) => [
        desc(tasks.priority),
        asc(tasks.createdOn),
      ],
    },
  },
  orderBy: (categories, { desc }) => [desc(categories.priority)],
});


export type resultType = typeof data