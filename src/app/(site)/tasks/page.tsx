import DashboardNav from "@/components/dashboard/dashboard-nav";
import { EventVisualizer } from "@/components/tasks/EventVisualizer";
import TaskMaster from "@/components/tasks/TaskMaster";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";

const TaskPage = () => {
  return (
    <div className="px-4">
      <DashboardNav />
      <Separator orientation="horizontal"  className="w-full h-[1px] bg-primary"/>
      <main className="flex">
        <Suspense fallback={<div>...Loading</div>}>
        <TaskMaster />
        </Suspense>
        {/* <div className="flex">
        <EventVisualizer />
        </div> */}
      </main>
    </div>
  );
};

export default TaskPage;
