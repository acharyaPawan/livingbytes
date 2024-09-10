"use client"


import * as React from "react";

import { cn, getEndOfDay } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { trackerFrequency } from "@/server/db/schema";
import Link from "next/link";
import { createNewTracker } from "@/actions/trackers";
import { addDays, format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { CalendarIcon } from "lucide-react";


export type OptionType = "Reference Already Existing One" | "Create New And Track"
export const trackerFormOptionValue = ["Create New And Track", "Reference Already Existing One"] as const

// Define a type for the props
interface DialogDrawerFrameProps {
  label: string;
  description: string;
  children: React.ReactNode;
}

// Define a type for the ref
export interface DialogDrawerFrameHandle {
  // Define methods or properties that can be accessed via ref
  toggleVisibility: () => void;
}

export const DialogDrawerFrame = React.forwardRef<
  DialogDrawerFrameHandle,
  DialogDrawerFrameProps
>(({ label, description, children }, ref) => {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const toggleVisibility = () => {
    setOpen(!open);
  };

  React.useImperativeHandle(ref, () => {
    return {
      toggleVisibility,
    };
  });

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">{label}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">{label}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{label}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4">{children}</div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
});

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

export type formdataCreateNewTracker = z.infer<
  typeof FormSchemaCreateNewTracker
>;

export function TrackerForm({ closeFunc, className }: { closeFunc: () => void, className: string }) {
  const [isPending, startTransition] = React.useTransition();
  const [isTaskIdMode, setTaskIdMode] = React.useState(false);
  const form = useForm<z.infer<typeof FormSchemaCreateNewTracker>>({
    resolver: zodResolver(FormSchemaCreateNewTracker),
    defaultValues: {
      title: "",
      frequency: "Daily",
      range: {
        from: startOfToday(),
        to: getEndOfLastMomentOfDateSevenDaysFromToday(),
      },
    },
  });
  const handleEventTypeChange = (selectedType: OptionType) => {
    setTaskIdMode(selectedType === "Reference Already Existing One");
  };

  function onSubmit(data: z.infer<typeof FormSchemaCreateNewTracker>) {
    startTransition(async () => {
      await createNewTracker(data)
        .then((message) => console.log("message is ", message))
        .catch((error) => {
          console.log("error ", error);
        });
    });
    closeFunc();
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }





  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("w-2/3 space-y-6"), className}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>, 
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>This is title for your tracker.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a suitable frequency." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* "Yearly", "HalfYearly", "Quarterly", "Monthly", "Weekly", "Daily"]> */}
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly" disabled>Weekly</SelectItem>
                  <SelectItem value="Montly" disabled>Monthly</SelectItem>
                  <SelectItem value="Yearly" disabled>Yearly</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                You can later change the values later. Experimental, try Daily
                for now.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="taskIdEff"
          render={({field}) => (
  <FormItem>
              <FormLabel>Select one option</FormLabel>
              <Select onValueChange={(value) => {
                  field.onChange(value);
                  handleEventTypeChange(value as OptionType);
                }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select one approate option to continue." />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  {trackerFormOptionValue.map(x => 
                    <SelectItem value={x} key={x}>{x}</SelectItem>
                  )}
                  {/* <SelectItem value="m@example.com"></SelectItem>
                  <SelectItem value="m@google.com">m@google.com</SelectItem>
                  <SelectItem value="m@support.com">m@support.com</SelectItem> */}
                </SelectContent>
              </Select>
              <FormDescription>
                Form will be customized on the basis of this value.
                {/* <Link href="/examples/forms">email settings</Link>. */}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
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
        {!!!isTaskIdMode && (
          <FormField
            control={form.control}
            name="taskTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name for tracking task</FormLabel>
                <FormControl>
                  <Input placeholder="70909t9qre98" {...field} />
                </FormControl>
                <FormDescription>
                  This is name for new task you want to start track.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {!!isTaskIdMode && (
          <FormField
            control={form.control}
            name="taskId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task Id</FormLabel>
                <FormControl>
                  <Input placeholder="70909t9qre98" {...field} />
                </FormControl>
                <FormDescription>
                  This is id of task you want to track.
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
                <Input placeholder="Id specify dog walking task" {...field} />
              </FormControl>
              <FormDescription>
                This is remark for your tracker.
              </FormDescription>
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

export const AddNewTracker = ({className}: {className: string}) => {
  const dialogRef = React.useRef<DialogDrawerFrameHandle>(null);
  return (
    <div>
      <DialogDrawerFrame
        label={"Add New Tracker"}
        description="Complete this to create new Drawer."
        ref={dialogRef}
      >
        <TrackerForm closeFunc={() => dialogRef.current?.toggleVisibility()} className={className} />
      </DialogDrawerFrame>
    </div>
  );
};
