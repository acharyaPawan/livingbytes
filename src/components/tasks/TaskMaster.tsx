"use client"

import { useState } from "react";
import RenderCategorizedTasks from "./RenderCategorizedTasks";


import dummyChoresList from "@/dummydata/dummydata";
import { Button } from "../ui/button";
import { AddNew } from "./AddNew";
  
  
  

const TaskMaster = () => {
    const [dailyChores, setDailyChores] = useState([])
    

  return (
    <div>
    <div>
      <h1 className="font-serif text-2xl">TaskMaster</h1>
    </div>
    <div>Whats Today?</div>
    <div>
        {dummyChoresList.map(categorifiedList => <RenderCategorizedTasks key={categorifiedList.id} category={categorifiedList} handleDelete={() => console.log('Category Deleted.')} />)}
    </div>
    <div>
      <AddNew />
    </div>
    </div>
  );
};

export default TaskMaster;
