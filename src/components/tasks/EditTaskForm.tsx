"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";

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

import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { z } from "zod";
import { EditTaskAction, EditTaskResponse, createNewTask } from "@/app/actions";
import { useRouter } from "next/navigation";
import { ExtendedFormValues, PriorityLabels, Task, TaskStatus, ViewAsType } from "@/types/types";
import { Switch } from "../ui/switch";
const PRIORITYENUM = [
  "High",
  "Less",
  "Moderate",
  "Very High",
  "Very Less",
] as const;
const VIEWASENUM = ["Checkbox", "Status"] as const;
const CATEGORYLIST = [
  "Morning Routine",
  "Work Tasks",
  "Household Chores",
] as const;
const TASKSTATUSENUM = ["Not Started", "In Progress", "Finished", "Paused", "Scheduled", "Expired"] as const
const categoryListArray = [
  "Morning Routine",
  "Work Tasks",
  "Household Chores",
  "Customize"
]

 const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  priority: z.enum(PRIORITYENUM, {
    required_error: "You need to select a priority level type.",
  }),
  remark: z.string().optional(),
  viewAs: z.enum(VIEWASENUM, {
    required_error: "You need to select a option below.",
  }),
  category: z
    .enum(CATEGORYLIST, {
      required_error: "Select one from dropdown.",
    })
    .or(z.string().min(3, {
      message: "Category name must be 3 character long."
    })),
  status: z.enum(TASKSTATUSENUM, {
    required_error: "Select one from dropdown.",
  }),
  locked: z.boolean()
});

export type formdata =  z.infer<typeof formSchema>

interface EditTaskFormProps {
  className?: string,
  closeFun: () => void,
  data: {
    id: string,
    title: string,
    description?: string | null,
    remark?: string | null,
    priorityLabel?: PriorityLabels | null,
    locked: boolean,
    viewAs: ViewAsType,
    status: TaskStatus
  },
  categoryName: string
}


export function EditTaskForm({className, closeFun, data, categoryName}: EditTaskFormProps) {
  const router = useRouter()

  const [isPending, startTransition] = useTransition();

  // const queryClient = useQueryClient()


  const [isCustomCategory, setCustomCategory] = useState(false);

  const handleCategoryChange = (selectedCategory: string) => {
    setCustomCategory(selectedCategory === "Customize");
    // if (categoryName) {
    //   setCustomCategory(true)
    // }
  };


 
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: data?.title || '',
      description: data?.description || '',
      category: categoryName || '',
      remark: data?.remark || '',
      priority: data?.priorityLabel || 'Moderate',
      viewAs: data?.viewAs || 'Status',
      status: data?.status || 'Not Started',
      locked: data?.locked,
    },
  });




  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    console.log('I am here')
    startTransition(async () => {
      try {
      const response: EditTaskResponse = await EditTaskAction({...values, taskId:data.id} as ExtendedFormValues);
      if (response.error) {
        console.log('error received in clientt', response.error)
      }
      console.log('data received in client ', response.data)
      } catch (error) {
        console.log('error received in clientt', error)
      }
      // queryClient.invalidateQueries({queryKey: getQueryKey(api.task.getCategorizedTasks.query ,undefined, 'query' )})
      closeFun()
      // queryClient.invalidateQueries({queryKey: getQueryKey(api.task.getCategorizedTasks ,undefined, 'query' )})
      router.refresh()
    });

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
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-8', className)}>
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
                    <SelectValue placeholder="Select a category for this task." />
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
                  <SelectItem value="Customize">Customize</SelectItem>
                  {!categoryListArray.includes(categoryName) && <SelectItem value={categoryName}>{categoryName}</SelectItem>}
                  {/* {categoryName && } */}
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
                    placeholder="Enter custom category for the task"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is the custom category for your task.Edit to change name.
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Set Task Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a valid state for this task." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TASKSTATUSENUM.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  {/* <SelectItem value="Very High">Very High</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Less">Less</SelectItem>
                  <SelectItem value="Very Less">Very Less</SelectItem> */}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
              control={form.control}
              name="locked"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Lock 
                    </FormLabel>
                    <FormDescription>
                      If you want to restrict further change to the task behaviour, you have the option to lock the task away.
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
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
