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
import { AddNewForm } from "./AddNewForm"
import { ScrollArea } from "../ui/scroll-area"
import { EditTaskForm } from "./EditTaskForm"
import { PriorityLabels, Task, ViewAsType } from "@/types/types"

interface EditTaskProps {
  categoryName: string;
  data: {
    id: string,
    title: string,
    description?: string | null,
    remark?: string | null,
    priorityLabel?: PriorityLabels | null,
    viewAs: ViewAsType
  }
}

export function EditTask({data, categoryName}: EditTaskProps) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Edit Task</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] h-2/3 overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to your task details here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <EditTaskForm closeFun={() => {setOpen(false)}} data={data} categoryName={categoryName}/>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DrawerTrigger>
      <DrawerContent className="h-5/6">
      <ScrollArea className='h-screen'>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit Task</DrawerTitle>
          <DrawerDescription>
            Make changes to your tasks details here. Click save when you're done.
          </DrawerDescription>
        </DrawerHeader>
        <EditTaskForm closeFun={() => {setOpen(false)}} data={data} categoryName={categoryName} className="px-4"/>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}

