import TaskBoard from "@/components/tasks/TaskBoard";
import { getCategorizedTask } from "@/data/task/task";

const TaskPage = async () => {
  const categories = await getCategorizedTask();

  return (
    <div className="h-full w-full overflow-y-auto px-2 pb-10 lg:px-4">
      <TaskBoard categories={categories} />
    </div>
  );
};

export default TaskPage;
