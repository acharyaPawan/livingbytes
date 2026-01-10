"use client";

import { CalendarPlus } from "lucide-react";
import { useState } from "react";

import type { EventFeedEntry } from "@/data/event/event";
import type { EventCreateInput } from "@/shared/event";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { EventForm } from "@/components/events/EventForm";

type Props = {
  onCreated?: (entry: EventFeedEntry) => void;
};

export const EventComposer = ({ onCreated }: Props) => {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();
  const mutation = api.event.create.useMutation({
    onError(error) {
      toast({
        title: "Could not create event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (values: EventCreateInput) => {
    const entry = await mutation.mutateAsync(values);
    toast({ title: "Event created", description: "Added to your calendar." });
    onCreated?.(entry);
    void utils.event.summary.invalidate();
    void utils.event.list.invalidate();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          New event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create event</DialogTitle>
          <DialogDescription>
            Plan a milestone, track a personal moment, or schedule a reminder.
          </DialogDescription>
        </DialogHeader>
        <EventForm
          submitLabel="Create event"
          isSubmitting={mutation.isLoading}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EventComposer;
