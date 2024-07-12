// import DashboardNav from "@/components/dashboard/dashboard-nav";
// import { EventVisualizer } from "@/components/tasks/EventVisualizer";
import loadingState from "@/components/loadingState";
import TaskMaster from "@/components/tasks/TaskMaster";
// import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";

const TaskPage = () => {
  return (
    <div>
      <div className="flex">
        <Suspense fallback={loadingState}>
          <TaskMaster />
        </Suspense>
        {/* <div className="flex">
        <EventVisualizer />
        </div> */}
      </div>
    </div>
  );
};

export default TaskPage;
