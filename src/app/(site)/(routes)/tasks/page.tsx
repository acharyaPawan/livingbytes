// import DashboardNav from "@/components/dashboard/dashboard-nav";
// import { EventVisualizer } from "@/components/tasks/EventVisualizer";
import TaskMaster from "@/components/tasks/TaskMaster";
// import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";

const TaskPage = () => {
  return (
    <div>
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
