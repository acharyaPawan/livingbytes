"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useTransition } from "react";
import { useForm, useFormState, type Resolver } from "react-hook-form";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Link from "next/link";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { CalendarIcon, Plus } from "lucide-react";
import { z } from "zod";
import { createNewSubtask, createNewTask } from "@/app/actions";
import { useRouter } from "next/navigation";
import { TaskType } from "@/types/types";
import { priorityLabels } from "@/server/db/schema";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { Switch } from "../ui/switch";
import { revalidateTagsAction } from "@/actions/utils";
import { formSchema } from "../events/AddNewEvent";
import { formSchemaAddNewTask } from "@/app/schemas";




 type formdata = z.infer<typeof formSchemaAddNewTask>;

// Function to format the time as HH:MM
const formatTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export function AddNewForm({
  className,
  closeFun,
  subtask,
}: {
  className?: string;
  closeFun: () => void;
  subtask?: { taskId: string };
}) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [isCustomCategory, setCustomCategory] = useState(false);
  const [isCustomExpiry, setCustomExpiry] = useState(false);

  const handleCategoryChange = (selectedCategory: string) => {
    setCustomCategory(selectedCategory === "Custom");
  };

  const handleExpiryChange = (selectedExpiry: string) => {
    switch (selectedExpiry) {
      case "By End Of Today":
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        form.setValue("expiresOn", endOfToday);
        setCustomExpiry(false);

        break;
      case "By Tomorrow":
        const endOfTomorrow = new Date();
        endOfTomorrow.setDate(endOfTomorrow.getDate() + 1); // Move to the next day
        endOfTomorrow.setHours(23, 59, 59, 999); // Set to 11:59:59 PM of that day
        form.setValue("expiresOn", endOfTomorrow);
        setCustomExpiry(false);

        break;
      case "In 5 Hours":
        const currentDate = new Date(); // Get the current date and time

        // Add 5 hours to the current time
        const futureDate = new Date(currentDate.getTime() + 5 * 60 * 60 * 1000);
        form.setValue("expiresOn", futureDate);
        setCustomExpiry(false);
        break;
      case "Set Custom":
        setCustomExpiry(true);
        break;
      default:
        setCustomExpiry(false);
        form.setError("shortListedExpiresOn", {
          message: `${selectedExpiry} is not valid option.`,
        });
        break;
    }
  };

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchemaAddNewTask>>({
    resolver: zodResolver(formSchemaAddNewTask) as Resolver<
      z.infer<typeof formSchemaAddNewTask>
    >,
    defaultValues: {
      title: "",
      description: "",
      remark: "",
      scheduled: false,
      priority: "Moderate",
      viewAs: "Checkbox",
      category: "Not Specified",
      expiresOn: new Date(new Date().setHours(23, 59, 59, 999)),
      scheduledOn: undefined,
    },
  });

  // 2. Define a submit handler.
function onSubmit(values: z.infer<typeof formSchemaAddNewTask>) {
  startTransition(async () => {
    if (!subtask?.taskId) {
      const response = await createNewTask(values);
      if (response.data) {
        toast({
          title: "Task created",
          description: "The task is ready on your board.",
        });
      } else {
        toast({
          title: "Task creation failed",
          description: response.error ?? "Something went wrong while saving.",
          variant: "destructive",
        });
      }
    } else {
      const response = await createNewSubtask(values, subtask.taskId);
      if (response.data) {
        toast({
          title: "Subtask created",
          description: "We added it under the parent task.",
        });
      } else {
        toast({
          title: "Subtask creation failed",
          description: response.error ?? "Could not save subtask.",
          variant: "destructive",
        });
      }
    }
    closeFun();
    router.refresh();
  });
}

  const [timeValue, setTimeValue] = useState<string>("00:00");
  const [scheduledTimeValue, setScheduledTimeValue] = useState<string>("00:00");

  useEffect(() => {
    const now = new Date(); // Get current date and time
    setTimeValue(formatTime(now)); // Set state with current time
  }, []);

  useEffect(() => {
    const now = new Date(); // Get current date and time
    setScheduledTimeValue(formatTime(now)); // Set state with current time
  }, []);

  const handleTimeChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setTimeValue(e.target.value);

    // Get the current "expiresOn" value
    const currentExpiresOn = form.getValues("expiresOn");

    if (currentExpiresOn) {
      const [hours, minutes] = e.target.value.split(":").map(Number);

      // Create a new Date object from the current "expiresOn" value
      const updatedDate = new Date(currentExpiresOn);

      // Set the new time on the Date object
      updatedDate.setHours(hours ?? 10, minutes, 0, 0);

      // Update the form's "expiresOn" value with the new date and time
      form.setValue("expiresOn", updatedDate);
    }
  };

  const handleScheduledTimeChange: React.ChangeEventHandler<
    HTMLInputElement
  > = (e) => {
    setScheduledTimeValue(e.target.value);

    // Get the current "expiresOn" value
    const currentExpiresOn = form.getValues("scheduledOn");

    if (currentExpiresOn) {
      const [hours, minutes] = e.target.value.split(":").map(Number);

      // Create a new Date object from the current "expiresOn" value
      const updatedDate = new Date(currentExpiresOn);

      // Set the new time on the Date object
      updatedDate.setHours(hours ?? 10, minutes, 0, 0);

      // Update the form's "expiresOn" value with the new date and time
      form.setValue("scheduledOn", updatedDate);
    }
  };

  console.log("Form errors: ", JSON.stringify(form.formState.errors, null, 2))

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-8", className)}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  placeholder={`Enter title for the ${!subtask?.taskId ? "task" : "subtask"}.`}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is title for your {!subtask?.taskId ? "tasks" : "subtasks"}
                .
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discription</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  placeholder={`Enter description for the ${!subtask?.taskId ? "task" : "subtask"}.`}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is description for your{" "}
                {!subtask?.taskId ? "task" : "subtask"}.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>

              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleCategoryChange(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Select a category for this ${!subtask?.taskId ? "task" : "subtask"}`}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Morning Routine">
                    Morning Routine
                  </SelectItem>
                  <SelectItem value="Work Tasks">Work Tasks</SelectItem>
                  <SelectItem value="Household Chores">
                    Household Chores
                  </SelectItem>
                  <SelectItem value="Not Specified">Not Specified</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>

                  {/* Location where i want selectitem but that item should be input field and it sends vlaue that we input.For your instance this is for custom category. */}
                </SelectContent>
              </Select>
              <FormDescription>This can be changed later.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {isCustomCategory && (
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Category</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    placeholder={`Enter custom category for the ${!subtask?.taskId ? "task" : "subtask"}.`}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is the custom category for your{" "}
                  {!subtask?.taskId ? "task" : "subtask"}.Edit to change name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a valid priority level." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Very High">Very High</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Less">Less</SelectItem>
                  <SelectItem value="Very Less">Very Less</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="shortListedExpiresOn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expires On</FormLabel>

              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleExpiryChange(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={`Select when to expire this ${!subtask?.taskId ? "task" : "subtask"}`}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="By End Of Today">
                    By End Of Today
                  </SelectItem>
                  <SelectItem value="By Tomorrow">By Tomorrow</SelectItem>
                  <SelectItem value="In 5 Hours">In 5 hours</SelectItem>
                  <SelectItem value="Set Custom">Set Custom</SelectItem>
                  {/* Location where i want selectitem but that item should be input field and it sends vlaue that we input.For your instance this is for custom category. */}
                </SelectContent>
              </Select>
              <FormDescription>This can be changed later.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {isCustomExpiry && (
          <FormField
            control={form.control}
            name="expiresOn"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expires On(value) </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP HH:mm") // Display date and time
                        ) : (
                          <span>Pick a date and time</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <div className="flex items-center space-x-4">
                      {/* Calendar Component */}
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            // Combine selected date with current time
                            const dateTime = new Date(
                              date.setHours(
                                parseInt(timeValue.split(":")[0] as string, 10),
                                parseInt(timeValue.split(":")[1] as string, 10),
                              ),
                            );
                            field.onChange(dateTime);
                          }
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                          date < new Date("1900-01-01")
                        }
                        // initialFocus
                      />
                      {/* Time Input Field */}
                      <input
                        type="time"
                        value={timeValue}
                        onChange={handleTimeChange}
                        className="rounded border p-1"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Your date and time are important for something.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="scheduled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Schedule Task</FormLabel>
                <FormDescription>
                  Schedule task at particular date and time.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {form.getValues("scheduled") === true && (
          <FormField
            control={form.control}
            name="scheduledOn"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Schedule on</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP HH:mm") // Display date and time
                        ) : (
                          <span>Pick a date and time</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <div className="flex items-center space-x-4">
                      {/* Calendar Component */}
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            // Combine selected date with current time
                            const dateTime = new Date(
                              date.setHours(
                                parseInt(timeValue.split(":")[0] as string, 10),
                                parseInt(timeValue.split(":")[1] as string, 10),
                              ),
                            );
                            field.onChange(dateTime);
                          }
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                          date < new Date("1900-01-01")
                        }
                        // initialFocus
                      />
                      {/* Time Input Field */}
                      <input
                        type="time"
                        value={scheduledTimeValue}
                        onChange={handleScheduledTimeChange}
                        className="rounded border p-1"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Your date and time are important for something.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="remark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remark</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  placeholder={`Enter remark for the ${!subtask?.taskId ? "task" : "subtask"}.`}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is remark for your {!subtask?.taskId ? "task" : "subtask"}.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="viewAs"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>View As</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Checkbox" />
                    </FormControl>
                    <FormLabel className="font-normal">CheckBox</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Status" />
                    </FormControl>
                    <FormLabel className="font-normal">List</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
