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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { AddNewEvent } from "./AddNewEvent"
import { ScrollArea } from "../ui/scroll-area"

export function AddNewEventDialog({type} : {type: string}) { 
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] h-2/3 overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Complete the form below.
            </DialogDescription>
          </DialogHeader>
      
          {(type === 'event') && (
          <AddNewEvent closeFun={() => {setOpen(false)}}/>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Add New</Button>
      </DrawerTrigger>
      <DrawerContent className="h-5/6">
      <ScrollArea className='h-screen'>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add New Event</DrawerTitle>
          <DrawerDescription>
          Complete the form below. Click save when you're done.
          </DrawerDescription>
        </DrawerHeader>
        <AddNewEvent closeFun={() => setOpen(false)} className="px-4" />
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

