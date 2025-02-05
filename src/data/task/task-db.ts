import 'server-only'
import db from '@/server/db';
import { unstable_cache } from 'next/cache';
import { categories } from 'drizzle/schema';

export const getCachedCategorizedTask = (userId: string) => unstable_cache(async (userId) => {
    return await db.query.categories.findMany({
      limit: 10,
      columns: {
        id: true,
        title: true,
        labels: true,
        description: true,
      },
      with: {
        tasks: { 
          columns: {
            id: true,
            effectiveOn: true,
            expiresOn: true,
            title: true,
            description: true,
            priorityLabel: true,
            locked: true,
            status: true,
            viewAs: true,
            user_order: true,
            remark: true,
          },
          with: {
            subtasks: {
              columns: {
                title: true,
                description: true,
                remark: true,
                priorityLabel: true,
                effectiveOn: true,
                expiresOn: true,
                // categoryId: true,
                locked: true,
                id: true,
                status: true,
                viewAs: true,
              },
              with: {
                category: {
                  columns: {
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
                    title: true,
                  },
                },
              },
            },
          },
          where: (tasks, { eq }) => eq(tasks.userId, userId),
          // where: and(isNull(tasks.completedOn), lt(tasks.expiresOn, new Date())),
          orderBy: (tasks, { desc, asc }) => [
          //desc(tasks.prioiry),
            desc(tasks.effectiveOn),
          ],
          limit: 5,
        },
      },
      where: (categories, {eq}) => eq(categories.userId, userId),
    orderBy: (categories, { desc }) => [desc(categories.createdOn)],
    },
  );
  }, [], {tags: [`all-tasks-${userId}`]})(userId);
  
  
  export type categoriesWithTasksType = Awaited<ReturnType<typeof getCachedCategorizedTask>>