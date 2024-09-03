"use client"
import * as React from "react"

import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"



import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { toast } from "@/hooks/use-toast"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { trackerFrequency } from "@/server/db/schema"
import Link from "next/link"
import { createNewTracker } from "@/actions/trackers"

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

export const DialogDrawerFrame = React.forwardRef<DialogDrawerFrameHandle, DialogDrawerFrameProps>(
  ({ label, description, children }, ref) => {
      const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const toggleVisibility = () => {
    setOpen(!open)
  }

  React.useImperativeHandle(ref, () => { 
       return { 
        toggleVisibility   
      } 
    }
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">{label}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">{label}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{label}</DrawerTitle>
          <DrawerDescription>
            {description}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">{children}</div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
})



const FormSchemaCreateNewTracker = z.object({
  title: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  frequency: z.enum(trackerFrequency.enumValues)
})

export type formdataCreateNewTracker = z.infer<typeof FormSchemaCreateNewTracker>;

export function TrackerForm({closeFunc}: {closeFunc: () => void}) {
  const [isPending, startTransition] = React.useTransition()
  const form = useForm<z.infer<typeof FormSchemaCreateNewTracker>>({
    resolver: zodResolver(FormSchemaCreateNewTracker),
    defaultValues: {
      title: "",
      frequency: "Daily",
    },
  })

  function onSubmit(data: z.infer<typeof FormSchemaCreateNewTracker>) {
    startTransition(async () => {
      await createNewTracker(data).then((message) => console.log("message is ", message)).catch((error) => {
        console.log("error ", error)
      }
      )
    })
    closeFunc()
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is title for your tracker.
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
                    <SelectValue placeholder="Select a suitable frequency." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                {/* "Yearly", "HalfYearly", "Quarterly", "Monthly", "Weekly", "Daily"]> */}
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Montly">Monthly</SelectItem>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                You can later change the values later. Experimental, try Daily for now.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>Submit</Button>
      </form>
    </Form>
  )
}


export const AddNewTracker = () => {
  const dialogRef = React.useRef<DialogDrawerFrameHandle>(null);
  return (
    <div>
        <DialogDrawerFrame label={"Add New Tracker"} description="Complete this to create new Drawer." ref={dialogRef}>
          <TrackerForm closeFunc={() => dialogRef.current?.toggleVisibility()} />
        </DialogDrawerFrame>
      </div>
  )
}
