"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

import { addDays, format } from "date-fns";

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

import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { createEventAction } from "@/app/actions";


const PRIORITYENUM = [
  "High",
  "Less",
  "Moderate",
  "Very High",
  "Very Less",
] as const;

const TYPE = ["single", "schedule", "range"] as const;

export const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  tags: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  //Configure event nature.
  remark: z.string().min(3, {
    message: "Remark must be at least 3 characters.",
  }),
  type: z.enum(TYPE, {
    required_error: "Select one from dropdown.",
  }),
  range: z.object({
    from: z.date({ required_error: "Start date is required." }),
    to: z.date({ required_error: "End date is required." }),
  }).refine(
    (data) => data.from > addDays(new Date(), -1),
    "Start date must be in the future"
  ).optional(),
  EventTimeStamp: z.date({
    required_error: "A date of birth is required.",
  }).optional(),
});

export type formdataEvent = z.infer<typeof formSchema>;

export function AddNewEvent({
  className,
  closeFun,
}: {
  className?: string;
  closeFun: () => void;
}) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [isRangeEvent, setIsRangeEvent] = useState(false);

  const handleEventTypeChange = (selectedType: string) => {
    setIsRangeEvent(selectedType === "range");
  };

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      remark: "",
      type: "single",
      tags: "",
    },
  });


  

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log('I am here')
    startTransition(async () => {
      console.log("request sent")
      const response = await createEventAction(values);
      console.log('response received')
      closeFun();
      router.refresh();
    });

    console.log(values);

    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    });
    console.log(values);
  }

  const [timeValue, setTimeValue] = useState<string>("00:00");

  const handleTimeChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setTimeValue(e.target.value);
    form.setValue(
      "EventTimeStamp",
      new Date(
        `${form.getValues("EventTimeStamp")?.toISOString().split("T")[0]}T${e.target.value}`,
      ),
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-8", className)}
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Choose what type of event?</FormLabel>

              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleEventTypeChange(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select what do you want?" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="single">Single Day Event</SelectItem>
                  <SelectItem value="range">Range Event</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>This can be changed later.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  placeholder="Enter title for the task"
                  {...field}
                />
              </FormControl>
              <FormDescription>This is title for your task.</FormDescription>
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
                  placeholder="Enter description for the task."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is description for your task.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  placeholder="Enter tags, each separated by comma."
                  {...field}
                />
              </FormControl>
              <FormDescription>This is for tags.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {!isRangeEvent && <FormField
          control={form.control}
          name="EventTimeStamp"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date and time</FormLabel>
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
                        date > new Date() || date < new Date("1900-01-01")
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
        />}
        {isRangeEvent && (
          <FormField
          control={form.control}
          name="range"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Period</FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value?.from ? (
                        field.value.to ? (
                          <>
                            {format(field.value.from, "LLL dd, y")} -{" "}
                            {format(field.value.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(field.value.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      // initialFocus
                      mode="range"
                      defaultMonth={field.value?.from}
                      selected={field.value}
                      onSelect={field.onChange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormDescription>
                Select the duration of event happening.
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
                  placeholder="Enter remark for the task"
                  {...field}
                />
              </FormControl>
              <FormDescription>This is remark for your task.</FormDescription>
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
