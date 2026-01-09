import "server-only";

import { unstable_cache } from "next/cache";

import db from "@/server/db";

export const getCachedCategorizedTask = (userId: string) =>
  unstable_cache(
    async (userId: string) => {
      const rows = await db.query.categories.findMany({
        where: (category, { eq }) => eq(category.userId, userId),
        columns: {
          id: true,
          title: true,
          labels: true,
          description: true,
          createdOn: true,
        },
        orderBy: (category, { desc }) => [desc(category.createdOn)],
        limit: 25,
        with: {
          tasks: {
            where: (task, { isNull, and, eq }) =>
              and(isNull(task.parentId), eq(task.userId, userId)),
            columns: {
              id: true,
              categoryId: true,
              effectiveOn: true,
              expiresOn: true,
              title: true,
              description: true,
              priorityLabel: true,
              locked: true,
              scheduled: true,
              flexible: true,
              status: true,
              viewAs: true,
              labels: true,
              user_order: true,
              parentId: true,
              remark: true,
              createdOn: true,
              updatedOn: true,
              completedOn: true,
            },
            orderBy: (task, { asc, desc }) => [
              asc(task.expiresOn),
              desc(task.effectiveOn),
            ],
            with: {
              subtasks: {
                columns: {
                  id: true,
                  taskId: true,
                  categoryId: true,
                  title: true,
                  description: true,
                  remark: true,
                  priorityLabel: true,
                  effectiveOn: true,
                  expiresOn: true,
                  createdOn: true,
                  locked: true,
                  status: true,
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
              trackersTasksMap: {
                columns: {},
                with: {
                  tracker: {
                    columns: {
                      id: true,
                      title: true,
                      frequency: true,
                      status: true,
                      startOn: true,
                      endOn: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return rows.map((category) => ({
        ...category,
        tasks: category.tasks.map((task) => ({
          ...task,
          categoryTitle: category.title,
          subtasks: task.subtasks.map((subtask) => ({
            ...subtask,
            categoryTitle: subtask.category?.title ?? category.title,
          })),
          trackers: task.trackersTasksMap
            .map((link) => link.tracker)
            .filter(Boolean),
        })),
      }));
    },
    [],
    { tags: [`all-tasks-${userId}`] },
  )(userId);

export type categoriesWithTasksType = Awaited<
  ReturnType<typeof getCachedCategorizedTask>
>;
