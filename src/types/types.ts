import { formdata } from "@/components/tasks/AddNewForm";
import { formdata as formdataFromEdit } from "@/components/tasks/EditTaskForm";

export type TaskStatus = "Not Started" | "In Progress" | "Finished" | "Paused" | "Scheduled" | "Expired";
export type PriorityLabels = "High" | "Less" | "Moderate" | "Very High" | "Very Less";
export type TrackerFrequency = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "HalfYearly" | "Yearly";
export type ViewAsType = "Checkbox" | "Status";
export type TaskType = "tasks" | "subtasks"
// export const taskStatusValues: TaskStatus[] = [
//   "Not Started",
//   "In Progress",
//   "Finished",
//   "Paused",
//   "Scheduled",
//   "Expired",
// ];

//Priority number give it values multiple of 10 within reange of 100.

export interface Tracker {
  id: number;
  title: string;
  frequency: string;
  createdOn: Date;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  description: string;
  status: string;
  priority: number;
  locked: boolean;
  flexible: boolean;
  priorityLabel: PriorityLabels;
  createdOn: Date;
  expiresOn: Date;
  completedOn: Date;
  viewAs: ViewAsType;
  specialLabels: string[];
  remark: string;
  tracker: Tracker[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: number;
  locked: boolean;
  flexible: boolean;
  // priorityLabel: PriorityLabels;
  createdOn: Date;
  expiresOn: Date;
  completedOn: Date;
  viewAs: ViewAsType;
  // specialLabels: string[];
  remark: string;
  // subtasks: Subtask[];
  // tracker: Tracker[];
  subtasks: any;
  tracker: any;
  categoryId: string;
}

export interface Category {
  categoryid: number;
  categoryname: string;
  categorydescription: string;
  categorypriority: number;
  categorylabels: string;
  categoryremark: string;
  categorycreatedOn: Date;
  tasks: Task[];
}


export interface ExtendedFormValues extends formdataFromEdit {
  taskId: string;
}
