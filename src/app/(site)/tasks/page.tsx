import DashboardNav from "@/components/dashboard/dashboard-nav";
import TaskMaster from "@/components/tasks/TaskMaster";
import { Separator } from "@/components/ui/separator";

const TaskPage = () => {
  return (
    <div className="px-4">
      <DashboardNav />
      <Separator orientation="horizontal"  className="w-full h-[1px] bg-primary"/>
      <main>
        <TaskMaster />
      </main>
    </div>
  );
};

export default TaskPage;
