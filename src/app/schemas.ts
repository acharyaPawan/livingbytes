import { z } from "zod";
import {
  CATEGORYLIST,
  EXPIRYENUM,
  PRIORITYENUM,
  VIEWASENUM,
} from "./constants";

export const formSchemaAddNewTask = z
  .object({
    title: z.string().min(3, {
      message: "Title must be at least 3 characters.",
    }),
    description: z.string().optional(),
    priority: z.enum(PRIORITYENUM, {
      required_error: "You need to select a priority level type.",
    }),
    remark: z.string().optional(),

    category: z
      .enum(CATEGORYLIST, {
        required_error: "Select one from dropdown.",
      })
      .or(
        z.string().min(3, {
          message: "Category name must be 3 character long.",
        }),
      ),
    viewAs: z.enum(VIEWASENUM, {
      required_error: "You need to select a option below.",
    }),
    expiresOn: z.date({
      required_error: "Expiry date must be given.",
    }),
    shortListedExpiresOn: z.enum(EXPIRYENUM).optional(),
    scheduled: z.boolean().default(false),
    scheduledOn: z.date().optional(),
  })
  .strict({ message: "Out of spec data." })
  .refine((data) => !(data.scheduled && !data.scheduledOn), {
    message: "Impartial Data. If scheduled, schedule Date must be provided.",
    path: ["scheduledOn"],
  })
  .refine((data) => !(data.scheduled && data.scheduledOn && data.expiresOn < data.scheduledOn), {
    message: "Schedule Date must be before expiry date",
    path: ["scheduledOn"],
  });
