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
import { TaskType } from "@/types/types"

interface AddNewProps {
  subtask?: {
    taskId: string
  }
}

export function AddNew({subtask}: AddNewProps) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add New {(subtask?.taskId ? "Subtask": "Task")}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] h-2/3 overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>Add New</DialogTitle>
            <DialogDescription>
              This creates a new {(subtask?.taskId ? "Subtask": "Task")}. Click save when you are done.
            </DialogDescription>
          </DialogHeader>
          <AddNewForm closeFun={() => {setOpen(false)}} subtask={subtask}/>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Add New {(subtask?.taskId ? "Subtask": "Task")}</Button>
      </DrawerTrigger>
      <DrawerContent className="h-5/6">
      <ScrollArea className='h-screen'>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add New</DrawerTitle>
          <DrawerDescription>
            Saves {(subtask?.taskId ? "Subtask": "Task")}. Click save when you're done.
          </DrawerDescription>
        </DrawerHeader>
        <AddNewForm closeFun={() => setOpen(false)} subtask={subtask} className="px-4" />
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

