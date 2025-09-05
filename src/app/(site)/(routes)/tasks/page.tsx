import { ScrollArea } from "@/components/ui/scroll-area"

import ScrollPreview from "@/components/tasks2/PreviewScroll";
import { AddNew } from "@/components/tasks/AddNew";
import { unstable_cache } from "next/cache";
import { getCategorizedTask } from "@/data/task/task";


const TaskPage = async () => {

const dataFromDb = await getCategorizedTask();
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
