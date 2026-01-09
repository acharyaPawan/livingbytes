"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarClock, CalendarIcon, Plus, RefreshCcw, Sparkles } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { createNewTracker } from "@/actions/trackers";
import type { TrackerTaskOption } from "@/data/tracker/tracker";
import { trackerFrequency } from "@/server/db/schema";
import {
  FormSchemaCreateNewTracker,
  defaultTrackerRange,
  trackerFormOptions,
} from "@/shared/tracker";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { TaskPicker } from "@/components/trackers/TaskPicker";

export interface DialogDrawerFrameHandle {
  toggleVisibility: () => void;
}

interface DialogDrawerFrameProps {
  label: string;
  description: string;
  children: React.ReactNode;
}

export const DialogDrawerFrame = React.forwardRef<
  DialogDrawerFrameHandle,
  DialogDrawerFrameProps
>(({ label, description, children }, ref) => {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const toggleVisibility = () => {
    setOpen((prev) => !prev);
  };

  React.useImperativeHandle(ref, () => ({
    toggleVisibility,
  }));

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            {label}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-primary" />
              {label}
            </DialogTitle>
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
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          {label}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            {label}
          </DrawerTitle>
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
DialogDrawerFrame.displayName = "DialogDrawerFrame";

type TrackerFormProps = {
  taskOptions: TrackerTaskOption[];
  closeFunc: () => void;
  className?: string;
};

export function TrackerForm({
  closeFunc,
  className,
  taskOptions,
}: TrackerFormProps) {
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<z.infer<typeof FormSchemaCreateNewTracker>>({
    resolver: zodResolver(FormSchemaCreateNewTracker),
    defaultValues: {
      title: "",
      description: "",
      frequency: "Daily",
      linkMode: "create-task",
      existingTaskIds: [],
      range: defaultTrackerRange(),
    },
  });

  const linkMode = useWatch({
    control: form.control,
    name: "linkMode",
  });

  React.useEffect(() => {
    if (linkMode === "tracker-only") {
      form.setValue("existingTaskIds", []);
      form.setValue("newTaskTitle", undefined);
    }
    if (linkMode === "link-existing") {
      form.setValue("newTaskTitle", undefined);
    }
    if (linkMode === "create-task") {
      form.setValue("existingTaskIds", []);
    }
  }, [linkMode, form]);

  const handleSubmit = (data: z.infer<typeof FormSchemaCreateNewTracker>) => {
    startTransition(async () => {
      const payload = {
        ...data,
        existingTaskIds:
          data.linkMode === "link-existing" || data.linkMode === "mixed"
            ? data.existingTaskIds ?? []
            : [],
        newTaskTitle:
          data.linkMode === "create-task" || data.linkMode === "mixed"
            ? data.newTaskTitle
            : undefined,
      };

      const res = await createNewTracker(payload);
      if (res?.error) {
        toast({
          title: "Could not save tracker",
          description: res.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Tracker saved",
        description: "We linked tasks and refreshed your workspace.",
      });
      form.reset({
        title: "",
        description: "",
        frequency: "Daily",
        linkMode: "create-task",
        existingTaskIds: [],
        range: defaultTrackerRange(),
        newTaskTitle: "",
        remark: "",
      });
      closeFunc();
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("space-y-4", className)}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tracker title</FormLabel>
                <FormControl>
                  <Input placeholder="Morning routine, release follow-up..." {...field} />
                </FormControl>
                <FormDescription>
                  Keep it actionable and unique.
                </FormDescription>
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
                      <SelectValue placeholder="Select cadence" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {trackerFrequency.enumValues.map((freq) => (
                      <SelectItem key={freq} value={freq}>
                        {freq}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>How often this tracker expects activity.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Context, definition of done, or notes."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="range"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tracking window</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
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
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      defaultMonth={field.value?.from}
                      selected={field.value}
                      onSelect={field.onChange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Start and end dates drive status and due reminders.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Task strategy</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose how to link tasks" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {trackerFormOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Create a fresh task, link existing, or keep it standalone.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {(linkMode === "create-task" || linkMode === "mixed") && (
          <FormField
            control={form.control}
            name="newTaskTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New task to track</FormLabel>
                <FormControl>
                  <Input placeholder="Ship beta build, write spec..." {...field} />
                </FormControl>
                <FormDescription>
                  We create the task in your GENERAL category and link it here.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(linkMode === "link-existing" || linkMode === "mixed") && (
          <FormField
            control={form.control}
            name="existingTaskIds"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Attach existing tasks</FormLabel>
                  <Badge variant="secondary">{field.value?.length ?? 0} selected</Badge>
                </div>
                <FormControl>
                  <TaskPicker
                    options={taskOptions}
                    value={field.value ?? []}
                    onChange={field.onChange}
                    emptyLabel="No tasks found for this workspace."
                  />
                </FormControl>
                <FormDescription>
                  Attach multiple tasks. We will sync trackers to the task board.
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
                <Input placeholder="Optional reminder or context" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isPending} className="gap-2">
            <Sparkles className="h-4 w-4" />
            {isPending ? "Saving..." : "Save tracker"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => form.reset({ ...form.getValues(), range: defaultTrackerRange() })}
          >
            <RefreshCcw className="h-4 w-4" />
            Reset dates
          </Button>
        </div>
      </form>
    </Form>
  );
}

export const AddNewTracker = ({
  taskOptions,
  className,
}: {
  taskOptions: TrackerTaskOption[];
  className?: string;
}) => {
  const dialogRef = React.useRef<DialogDrawerFrameHandle>(null);
  return (
    <div className={className}>
      <DialogDrawerFrame
        label={"Add Tracker"}
        description="Create or link tasks to start tracking."
        ref={dialogRef}
      >
        <div className="space-y-4 rounded-lg bg-muted/40 p-2">
          <div className="rounded-md bg-background px-3 py-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <CalendarClock className="h-4 w-4 text-primary" />
              Planner + tracker + task links
            </div>
            <p>
              We create a tracker, optionally add a task, and wire it to the board so status
              changes stay in sync.
            </p>
          </div>
          <TrackerForm
            className="max-h-[70vh] overflow-y-auto pr-2"
            closeFunc={() => dialogRef.current?.toggleVisibility()}
            taskOptions={taskOptions}
          />
        </div>
      </DialogDrawerFrame>
    </div>
  );
};
