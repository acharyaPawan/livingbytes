"server-only"

import { trackerFrequency } from '@/server/db/schema';
import {z} from 'zod'

export const trackerFormOptionValue = ["Create New And Track", "Reference Already Existing One"] as const



function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function endOfDayOneYearFromToday() {
  const today = new Date();
  const oneYearFromToday = new Date(
    today.getFullYear() + 1,
    today.getMonth(),
    today.getDate(),
  );
  return new Date(
    oneYearFromToday.getFullYear(),
    oneYearFromToday.getMonth(),
    oneYearFromToday.getDate(),
    23,
    59,
    59,
    999,
  );
}

function getEndOfLastMomentOfDateSevenDaysFromToday() {
  const today = new Date();
  const sevenDaysFromToday = new Date(today);

  // Move the date forward by 6 days
  sevenDaysFromToday.setDate(today.getDate() + 6);

  // Set time to the last moment of that day
  sevenDaysFromToday.setHours(23, 59, 59, 999);

  return sevenDaysFromToday;
}

function normalizeStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function normalizeEndOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function isAtLeastOneWeekApart(fromDate: Date, toDate: Date) {
  // Normalize dates
  const startOfFromDate = normalizeStartOfDay(fromDate);
  const endOfToDate = normalizeEndOfDay(toDate);

  // Calculate the difference in milliseconds
  const differenceInMillis = endOfToDate.getTime() - startOfFromDate.getTime();

  // Convert milliseconds to days
  const differenceInDays = differenceInMillis / (1000 * 60 * 60 * 24);
  console.log('differenceInDays is ', differenceInDays)

  // Check if the difference is at least a week (7 days)
  return differenceInDays >= 7;
}

export const FormSchemaCreateNewTracker = z.object({
  title: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  frequency: z.enum(trackerFrequency.enumValues),
  // startOn: z.date({
  //   required_error: "StartOn date must be specified."
  // }),
  // endOn: z.date({
  //   required_error: "EndOn date must be specified."
  // }),
  range: z
    .object({
      from: z.date({ required_error: "Start date is required." }),
      to: z.date({ required_error: "End date is required." }),
    })
    .refine(
      (data) => data.from >= startOfToday(),
      "Start date must be today or days from today in future.",
    )
    .refine(
      (date) => date.to <= endOfDayOneYearFromToday(),
      "End day must be maximum one year from today",
    )
    .refine(
      (date) => isAtLeastOneWeekApart(date.from, date.to),
      "difference between two date must be atleast a week.",
    ),
    taskIdEff: z.enum(trackerFormOptionValue, {required_error: "Not in option/rule."}),
    taskId: z.string().optional(),
    taskTitle: z.string().optional(),
  remark: z.string().optional(),
}).refine((data) => {
  if (data.taskIdEff === "Create New And Track") {
    return (data.taskTitle && (data.taskTitle.length > 3))
  } else {
    return !!data.taskId
  }
}, {message: "Once selected option, condition should be fulfilled."});