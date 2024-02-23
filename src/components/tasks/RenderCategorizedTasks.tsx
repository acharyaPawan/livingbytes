"use client"

import { Category, Task, Subtask, Tracker } from '@/types/types'
import React from 'react';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { formatTimeDifference } from '@/lib/utils';

type TaskItemProps = {
    task: Task;
    handleDelete: (taskId: number) => void;
  };
  
  const TaskItem: React.FC<TaskItemProps> = ({ task, handleDelete }) => {
    const renderTaskContent = () => {
      // Implement logic to render task content based on viewAs
      // Check if the viewAs is Checkbox and render accordingly
      console.log(task)
      if (task.viewAs === "Checkbox") {
        return (
          <div className='flex items-center gap-2'>
            <Checkbox />
            <span>{task.title}</span>
            <span onClick={() => handleDelete(task.id)}>❌</span>
            <span>...</span>
          </div>
        );
      } else {
        // Implement logic to render task content for non-checkbox view
        return (
          <>
            <div className='flex gap-2'>
              <Badge>{task.status}</Badge>
              <span className='font-semibold'>{task.title}</span>
              <span className='font-light'>{task.description}</span>
              <Badge variant={'outline'}>{`created ${formatTimeDifference(task.createdOn.toString())}`}</Badge>
              {task.expiresOn && <span>{`expires on ${formatTimeDifference(task.expiresOn.toString())}`}</span>}
              <span>{task.priorityLabel}</span>
              {task.locked && <span>Locked</span>}
              {task.tracker && <span>Tracking</span>}
              {task.specialLabels && <span>{task.specialLabels[0]}</span>}
              {task.remark && <span className='dark:text-green-200 text-green-950'>{task.remark}</span>}
              <span>Edit</span>
              <span>. . .</span>
            </div>
            {/* Check if there are subtasks and render accordingly */}
            {typeof(task?.subtasks?.length) === "number" && task.subtasks.length > 0 && (
              <div>
                {task.subtasks.map((subtask: Subtask) => (
                  <SubTaskItem key={subtask.id} task={subtask} handleDelete={handleDelete} />
                ))}
              </div>
            )}
          </>
        );
      }
    };
  
    return <div>{renderTaskContent()}</div>;
  };


  type SubTaskItemProps = {
    task: Subtask;
    handleDelete: (taskId: number) => void;
  };
  
  const SubTaskItem: React.FC<SubTaskItemProps> = ({ task, handleDelete }) => {
    const renderTaskContent = () => {
      // Implement logic to render task content based on viewAs
      // Check if the viewAs is Checkbox and render accordingly
      if (task.viewAs === "Checkbox") {
        return (
          <>
            <input type="checkbox" />
            <span>{task.title}</span>
            <span onClick={() => handleDelete(task.id)}>❌</span>
            <span>...</span>
          </>
        );
      } else {
        // Implement logic to render task content for non-checkbox view
        return (
          <>
            <div>
              <span>{task.status}</span>
              <span>{task.title}</span>
              <span>{task.description}</span>
              <span>{JSON.stringify(task.createdOn)}</span>
              <span>{JSON.stringify(task.expiresOn)}</span>
              <span>{task.priorityLabel}</span>
              {task.locked && <span>Locked</span>}
              {task.tracker && <span>Tracking</span>}
              {task.specialLabels && <span>{task.specialLabels[0]}</span>}
              {task.remark && <span>{task.remark}</span>}
              <span>Edit</span>
              <span>...</span>
            </div>
            {/* Check if there are subtasks and render accordingly */}
          </>
        );
      }
    };
  
    return <div>{renderTaskContent()}</div>;
  };


  type CategoryHeaderProps = {
    title: string;
    description: string;
  };

  
  const CategoryHeader: React.FC<CategoryHeaderProps> = ({ title, description }) => {
    const headerClasses = `border-b-2 pb-4 mb-8 dark:border-gray-600 dark:text-white border-gray-300 text-gray-800}`;
  
    return (
      <div className="text-xl font-light tracking-wide font-mono">
        <h2 className="underline decoration-1">{title}</h2>
        <p>{description}</p>
      </div>
    );
  };

  



type RenderCategorizedTasksProps = {
  category: Category;
  handleDelete?: (taskId: number) => void;
};

const RenderCategorizedTasks: React.FC<RenderCategorizedTasksProps> = ({ category }) => {
  return (
    <div>
      <CategoryHeader title={category.categoryname} description={category.categorydescription} />
      <div className='m-4 ml-8 flex gap-2 flex-col'>
      {category.tasks?.map((task: Task) => (
        <TaskItem key={task.id} task={task} handleDelete={() => console.log('Handle delete')} />
      ))}
      </div>
    </div>
  );
};

export default RenderCategorizedTasks;

