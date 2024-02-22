import { CategoryType, TaskType } from "@/types/types";
import React from 'react';

type TaskItemProps = {
    task: TaskType;
    handleDelete: (taskId: number) => void;
  };
  
  const TaskItem: React.FC<TaskItemProps> = ({ task, handleDelete }) => {
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
              <span>{task.createdOn.toDateString()}</span>
              <span>{task.expiresOn.toDateString()}</span>
              <span>{task.priorityLabel}</span>
              {task.locked && <span>Locked</span>}
              {typeof(task.track?.trackerId) === "number" && <span>Tracking</span>}
              {task.SpecialLabels && <span>{task.SpecialLabels[0]}</span>}
              {task.remark && <span>{task.remark}</span>}
              <span>Edit</span>
              <span>...</span>
            </div>
            {/* Check if there are subtasks and render accordingly */}
            {typeof(task.subtasks?.length) === "number" && task.subtasks.length > 0 && (
              <div>
                {task.subtasks.map((subtask) => (
                  <TaskItem key={subtask.id} task={subtask} handleDelete={handleDelete} />
                ))}
              </div>
            )}
          </>
        );
      }
    };
  
    return <div>{renderTaskContent()}</div>;
  };


type CategoryHeaderProps = {
    category: CategoryType;
  };
  
  const CategoryHeader: React.FC<CategoryHeaderProps> = ({ category }) => {
    return (
      <div>
        <h2>{category.title}</h2>
        <p>{category.description}</p>
      </div>
    );
  };



type RenderCategorizedTasksProps = {
  category: CategoryType;
  handleDelete: (taskId: number) => void;
};

const RenderCategorizedTasks: React.FC<RenderCategorizedTasksProps> = ({ category, handleDelete }) => {
  return (
    <div>
      <CategoryHeader category={category} />
      {category.tasks?.map((task) => (
        <TaskItem key={task.id} task={task} handleDelete={handleDelete} />
      ))}
    </div>
  );
};

export default RenderCategorizedTasks;

