import RenderCategorizedTasks from "./RenderCategorizedTasks";

import { AddNew } from "./AddNew";
import { api } from "@/trpc/server";
import { Category } from "@/types/types";
  
  
  

 const TaskMaster = async () => {

    const data =  await api.task.getCategorizedTasks.query()
    // console.log('data is ', data[0]?.tasks)

  return (
    <div>
    <div>
      <h1 className="font-serif text-2xl">TaskMaster</h1>
    </div>
    <div>Whats Today?</div>
    <div className="mt-8">
        {data.map(categorifiedList => <RenderCategorizedTasks key={categorifiedList?.categoryid as number} category={categorifiedList as Category}  />)}
    </div>
    <div>
      <AddNew />
    </div>
    </div>
  );
};

export default TaskMaster;
