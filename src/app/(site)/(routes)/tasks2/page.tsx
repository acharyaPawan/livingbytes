import { getServerAuthSession } from "@/server/auth";
import db from "@/server/db";
import { subtasks, tasks } from "@/server/db/schema";
import { redirect } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area"

import ScrollPreview from "@/components/tasks2/PreviewScroll";
import { AddNew } from "@/components/tasks/AddNew";
import { unstable_cache } from "next/cache";
import { getCategorizedTask } from "@/data/task/task";


const TaskPage = async () => {

  //Get Previews for tasks grouped by categories by default, although one can collapse, so searchParam is needed.
  

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

const dataFromDb = await getCategorizedTask();
  console.log("Data is :", dataFromDb)
  // type resultType = typeof data;
  // console.log('data', await data())
  const categoriesWithActiveTasks = dataFromDb
  .map((cat) => ({
    ...cat,
    tasks: cat.tasks.filter((task) => task.status !== "Expired" && task.status !== "Scheduled")
  }))
  .filter((cat) => cat.tasks.length > 0);
  const categoriesWithScheduledTasks = dataFromDb.map((cat) => ({
    ...cat,
    tasks: cat.tasks.filter((task) => task.status === "Scheduled")
  })).filter((cat) => cat.tasks.length > 0);
  const categoriesWithExpiredTasks = dataFromDb.map((cat) => ({
    ...cat,
    tasks: cat.tasks.filter((task) => task.status === "Expired")
  })).filter((cat) => cat.tasks.length > 0);

  return (
    <div className="h-full w-full overflow-y-scroll scroll-smooth">
      <h2>Active Tasks</h2>
      <AddNew />
      <div className="border">
        <ScrollArea
          className={"h-full bg-background  text-gray-700 dark:text-slate-300"}
        >
    <ScrollPreview data={categoriesWithActiveTasks} />
        </ScrollArea>
      </div>
      <div className="border">
        <div>Scheuled Tasks</div>
        <ScrollArea
          className={"h-full bg-background  text-gray-700 dark:text-slate-300"}
        >
          <ScrollPreview data={categoriesWithScheduledTasks} />
        </ScrollArea>
      </div>
      <div className="border">
        <div>Expired Tasks</div>
        <ScrollArea
          className={"h-full bg-background  text-gray-700 dark:text-slate-300"}
        >
          <ScrollPreview data={categoriesWithExpiredTasks} />
        </ScrollArea>
      </div>
      <div>{/* completed Tasks aka history */}</div>
    </div>
  );
};

export default TaskPage;
