import { addDays, addYears, endOfDay, startOfDay } from "date-fns";
import { z } from "zod";

import { trackerFrequency } from "@/server/db/schema";

export const trackerFormOptionValue = [
  "create-task",
  "link-existing",
  "tracker-only",
  "mixed",
] as const;

export type TrackerLinkMode = (typeof trackerFormOptionValue)[number];

export const trackerFormOptions = [
  { value: "create-task", label: "Create a new task & link" },
  { value: "link-existing", label: "Link existing tasks" },
  { value: "mixed", label: "Blend: new + existing" },
  { value: "tracker-only", label: "Standalone tracker" },
] satisfies { value: TrackerLinkMode; label: string }[];

export const startOfToday = () => startOfDay(new Date());
export const defaultTrackerEnd = () => endOfDay(addDays(new Date(), 6));

const endOfDayOneYearFromToday = () => endOfDay(addYears(new Date(), 1));

const isAtLeastOneDayApart = (fromDate: Date, toDate: Date) => {
  const start = startOfDay(fromDate);
  const end = endOfDay(toDate);
  const diffInDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return diffInDays >= 1;
};

export const FormSchemaCreateNewTracker = z
  .object({
    title: z
      .string()
      .min(3, { message: "Give your tracker a descriptive title." })
      .max(120),
    description: z.string().max(320).optional(),
    frequency: z.enum(trackerFrequency.enumValues),
    range: z
      .object({
        from: z.date({ required_error: "Start date is required." }),
        to: z.date({ required_error: "End date is required." }),
      })
      .refine(
        (data) => data.from >= startOfToday(),
        "Start date must be today or later.",
      )
      .refine(
        (date) => date.to <= endOfDayOneYearFromToday(),
        "End date must be within one year.",
      )
      .refine(
        (date) => isAtLeastOneDayApart(date.from, date.to),
        "Range must be at least one day long.",
      ),
    linkMode: z.enum(trackerFormOptionValue).default("tracker-only"),
    existingTaskIds: z.array(z.string().uuid()).default([]),
    newTaskTitle: z.string().optional(),
    remark: z.string().max(240).optional(),
  })
  .refine((data) => {
    if (data.linkMode === "create-task") {
      return !!data.newTaskTitle && data.newTaskTitle.trim().length >= 3;
    }
    if (data.linkMode === "link-existing") {
      return data.existingTaskIds.length > 0;
    }
    if (data.linkMode === "mixed") {
      return (
        data.existingTaskIds.length > 0 ||
        (!!data.newTaskTitle && data.newTaskTitle.trim().length >= 3)
      );
    }
    return true;
  }, { message: "Add a task to track or pick the standalone mode." });

export const defaultTrackerRange = () => ({
  from: startOfToday(),
  to: defaultTrackerEnd(),
});
