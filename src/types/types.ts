export type TaskStatus = "Not Started" | "In Progress" | "Finished" | "Paused" | "Scheduled";
export type PriorityLabels = "High" | "Less" | "Moderate" | "Very High" | "Very Less";
export type TrackerFrequency = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "HalfYearly" | "Yearly";
export type ViewAsType = "Checkbox" | "Status";

//Priority number give it values multiple of 10 within reange of 100.

export type SubtaskType = {
  id: number;
  title: string;
  status: TaskStatus;
  description?: string;
  subtasks?: SubtaskType[];
  priorityLabel?: string;
  priority: number;
  scheduled?: {
    deploymentSchedule: Date;
  };
  locked: boolean;
  flexible: boolean;
  track?: {
    trackerId: number;
    trackerTitle: string;
    trackerFrequency: TrackerFrequency;
  };
  createdOn: Date;
  expiresOn: Date;
  completedOn?: Date;
  viewAs: ViewAsType;
  SpecialLabels?: string[];
  remark?: string;
};

export type TaskType = {
  id: number;
  title: string;
  status: TaskStatus;
  description?: string;
  subtasks?: SubtaskType[];
  priorityLabel?: string;
  priority: number;
  scheduled?: {
    deploymentSchedule: Date;
  };
  locked: boolean;
  flexible: boolean;
  track?: {
    trackerId: number;
    trackerTitle: string;
    trackerFrequency: TrackerFrequency;
  };
  createdOn: Date;
  expiresOn: Date;
  completedOn?: Date;
  viewAs: ViewAsType;
  SpecialLabels?: string[];
  remark?: string;
};

export type CategoryType = {
  id: number;
  title: string;
  tasks?: TaskType[];
  priority: number;
  labels?: string[];
  remark?:string;
  createdOn: Date;
  description?: string;
};
