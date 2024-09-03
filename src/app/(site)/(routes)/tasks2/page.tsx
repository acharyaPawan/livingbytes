import { getServerAuthSession } from "@/server/auth";
import db from "@/server/db";
import { subtasks, tasks } from "@/server/db/schema";
import { redirect } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

import { ScrollPreview } from "@/components/tasks2/PreviewScroll";
import { AddNew } from "@/components/tasks/AddNew";
import { unstable_cache } from "next/cache";

// console.log("data is ", data);

// type resultType = typeof data;

const TaskPage = async () => {
  // See if the user is logged in .
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/api/auth/signin");
    return;
  }

  const scheduledTaskToday = unstable_cache(async () => {
    console.log("not cached.");
    return await db.query.tasks.findMany({
      where: (tasks, { gt, lt, eq, and }) =>
        and(
          gt(tasks.effectiveOn, new Date(new Date().setHours(0, 0, 0, 0))),
          lt(tasks.effectiveOn, new Date(new Date().setHours(23, 59, 59, 999))),
          eq(tasks.status, "Scheduled"),
        ),
    });
  }, [
    String(new Date(new Date().setHours(0, 0, 0, 0)).getTime()),
    String(new Date(new Date().setHours(23, 59, 59, 999)).getTime()),
  ], {tags: ["scheduled-task-today"]});
  console.log("Scheduled task: ", await scheduledTaskToday());

  const scheduledSubtaskToday = unstable_cache(async () => {
    console.log("Not cached");
    return await db.query.subtasks.findMany({
      where: (subtasks, {gt, lt, eq, and}) => 
        and(
          gt(subtasks.effectiveOn, new Date(new Date().setHours(0, 0, 0, 0))),
          lt(
            subtasks.effectiveOn,
            new Date(new Date().setHours(23, 59, 59, 999)),
          ),
          eq(subtasks.status, "Scheduled"),
        ),
    });
  }, [
    String(new Date(new Date().setHours(0, 0, 0, 0)).getTime()),
    String(new Date(new Date().setHours(23, 59, 59, 999)).getTime()),
  ], {tags: ['scheduled-subtask-today']});
  console.log("Scheduled subtask: ", await scheduledSubtaskToday());

  //update tasks
  // async function processTasks(tasks) {
  //   const results = await Promise.all(tasks.map(async (task) => {
  //     return await doAsyncTask(task);
  //   }));
  //   results.forEach(result => console.log(result));
  // }
  if (scheduledTaskToday.length !== 0) {
    const results = await Promise.all(
      (await scheduledTaskToday()).map(async (task) => {
        return await db
          .update(tasks)
          .set({
            status: "Not Started",
          })
          .catch((e) => {
            return (
              <div>Error Occurred: In scheduled retrieval updation part.</div>
            );
          });
      }),
    );
    console.log("Tasks updated successfully.");
  }
  if (scheduledSubtaskToday.length !== 0) {
    const results = await Promise.all(
      (await scheduledSubtaskToday()).map(async (subtasks) => {
        // return await db.update(subtasks)
        return await db.update(subtasks).set({
            status: "Not Started",
          })
          .catch((e) => {
            return (
              <div>Error Occurred: In scheduled retrieval updation part.</div>
            );
          });
      }),
    );
    console.log("Subtasks updated successfully.");
  }

  const getCachedTasks = unstable_cache(async () => {
    console.log("Not cached.");
    return await db.query.categories.findMany({
      columns: {
        id: true,
        title: true,
        priority: true,
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
            priority: true,
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
          where: (tasks, { eq }) => eq(tasks.userId, session.user.id),
          // where: and(isNull(tasks.completedOn), lt(tasks.expiresOn, new Date())),
          orderBy: (tasks, { desc, asc }) => [
            desc(tasks.priority),
            desc(tasks.effectiveOn),
          ],
        },
      },
      orderBy: (categories, { desc }) => [desc(categories.priority)],
    });
  }, [session.user.id], {tags: ["all-tasks"]});

  const mockData = [
    {
      id: "1",
      title: "Category 1",
      priority: "1",
      priorityLabel: "High",
      tasks: [
        {
          id: "101",
          effectiveOn: new Date("2024-08-01T12:00:00Z"),
          expiresOn: new Date("2024-09-01T12:00:00Z"),
          title: "Task 1",
          description: "Description of Task 1",
          locked: false,
          status: "In Progress",
          viewAs: "Status",
          priority: "1",
          priorityLabel: "Very High",
          remark: "High priority",
          subtasks: [
            {
              id: "101",
              effectiveOn: new Date("2024-08-01T12:00:00Z"),
              expiresOn: new Date("2024-09-01T12:00:00Z"),
              title: "Task 1",
              description: "Description of Task 1",
              locked: false,
              status: "In Progress",
              viewAs: "Status",
              priorityLabel: "Important",
              priority: "1",
              category: {
                title: "In Morning",
              },
              remark: "High priority Remark",
              subtasks: [{ title: "Subtask 1.1" }, { title: "Subtask 1.2" }],
            },
          ],
          trackersTasksMap: [
            {
              tracker: {
                title: "Tracker A",
              },
            },
            {
              tracker: {
                title: "Tracker B",
              },
            },
          ],
        },
        {
          id: "102",
          effectiveOn: new Date("2024-08-05T12:00:00Z"),
          expiresOn: new Date("2024-08-30T12:00:00Z"),
          title: "Task 2",
          description: "Description of Task 2",
          locked: true,
          status: "Finished",
          viewAs: "Status",
          priority: "2",
          remark: "Completed early",
          subtasks: [],
          trackersTasksMap: [
            {
              tracker: {
                title: "Tracker C",
              },
            },
          ],
        },
      ],
    },
    {
      id: "2",
      title: "Category 2",
      priority: "2",
      tasks: [
        {
          id: "103",
          effectiveOn: new Date("2024-08-10T12:00:00Z"),
          expiresOn: new Date("2024-09-10T12:00:00Z"),
          title: "Task 3",
          description: "Description of Task 3",
          locked: false,
          status: "In Progress",
          viewAs: "Checkbox",
          priority: "3",
          remark: "Pending review",
          subtasks: [],
          trackersTasksMap: [
            {
              tracker: {
                title: "Tracker D",
              },
            },
          ],
        },
      ],
    },
    {
      id: "3",
      title: "Category 3",
      priority: "3",
      tasks: [
        {
          id: "104",
          effectiveOn: new Date("2024-08-15T12:00:00Z"),
          expiresOn: new Date("2024-09-15T12:00:00Z"),
          title: "Task 4",
          description: "Description of Task 4",
          locked: false,
          status: "Not Started",
          viewAs: "Status",
          priority: "4",
          remark: "Scheduled",
          subtasks: [],
          trackersTasksMap: [],
        },
      ],
    },
    {
      id: "4",
      title: "Category 4",
      priority: "4",
      tasks: [
        {
          id: "105",
          effectiveOn: new Date("2024-08-20T12:00:00Z"),
          expiresOn: new Date("2024-09-20T12:00:00Z"),
          title: "Task 5",
          description: "Description of Task 5",
          locked: false,
          status: "In Progress",
          viewAs: "Status",
          priority: "5",
          remark: "In progress",
          subtasks: [],
          trackersTasksMap: [
            {
              tracker: {
                title: "Tracker E",
              },
            },
          ],
        },
      ],
    },
    {
      id: "5",
      title: "Category 5",
      priority: "5",
      tasks: [
        {
          id: "106",
          effectiveOn: new Date("2024-08-25T12:00:00Z"),
          expiresOn: new Date("2024-09-25T12:00:00Z"),
          title: "Task 6",
          description: "Description of Task 6",
          locked: true,
          status: "Finished",
          viewAs: "Status",
          priority: "6",
          remark: "Completed",
          subtasks: [],
          trackersTasksMap: [
            {
              tracker: {
                title: "Tracker F",
              },
            },
          ],
        },
      ],
    },
    // Add more items to reach 10 as needed
  ];

  const dataFromDb = await getCachedTasks();
  console.log("data firn db: ",dataFromDb);
  // type resultType = typeof data;
  // console.log('data', await data())

  return (
    <div className="h-full w-full overflow-y-scroll scroll-smooth">
      <h2>Active Tasks</h2>
      <AddNew />
      <div className="border">
        <ScrollArea
          className={"h-full bg-background  text-gray-700 dark:text-slate-300"}
        >
          <ScrollPreview data={dataFromDb} />
        </ScrollArea>
      </div>
      <div>{/* completed Tasks aka history */}</div>
    </div>
  );
};

// const ScrollPreview = ({
//   data,
//   children,
// }: {
//   data: any;
//   children: ReactNode;
// }) => {
//   return <div>{}</div>;
// };

// const CategoryPreview = ({category})

export default TaskPage;
