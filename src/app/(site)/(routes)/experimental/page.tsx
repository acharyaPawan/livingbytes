import TaskMaster from "@/components/tasks/TaskMaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
const TabController = () => {
  return ( 
    <Tabs defaultValue="account" className="w-full">
  <TabsList className="flex justify-center place-items-center mx-auto w-[400px]">
    <TabsTrigger value="task-master">TaskMaster</TabsTrigger>
    <TabsTrigger value="events-and-schedules">Events+Schedules</TabsTrigger>
    <TabsTrigger value="logs">Logs</TabsTrigger>
  </TabsList>
  <TabsContent value="task-master"><TaskMaster /></TabsContent>
  <TabsContent value="events-and-schedules">
    <div>
      Events
    </div>
    
  </TabsContent>
  <TabsContent value="password">Change your password here.</TabsContent>
</Tabs>

   );
}
 
export default TabController;