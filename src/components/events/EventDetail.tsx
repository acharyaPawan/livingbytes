"use client";

import { ArrowLeft, Pencil, Pin, PinOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { EventFeedEntry } from "@/data/event/event";
import type { EventCreateInput } from "@/shared/event";
import { eventStatus, formatEventRange } from "@/shared/event";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { DeleteAlertDialog } from "@/components/shared/DeleteAlertDialog";
import { EventForm } from "@/components/events/EventForm";

type Props = {
  entry: EventFeedEntry;
};

export const EventDetail = ({ entry }: Props) => {
  const [open, setOpen] = useState(false);
  const status = eventStatus(entry);
  const utils = api.useUtils();
  const router = useRouter();

  const togglePin = api.event.togglePin.useMutation({
    onSuccess() {
      toast({ title: "Updated", description: "Pin status updated." });
      void utils.event.summary.invalidate();
    },
  });

  const updateEvent = api.event.update.useMutation({
    onSuccess() {
      setOpen(false);
      toast({ title: "Event updated", description: "Changes saved." });
      void utils.event.summary.invalidate();
    },
    onError(error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const removeEvent = api.event.remove.useMutation({
    onSuccess() {
      toast({ title: "Event deleted", description: "Returning to events list." });
      void utils.event.summary.invalidate();
      router.push("/events");
    },
    onError(error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    },
  });

  const defaultValues = useMemo(() => {
    const startDate = entry.startDate ? new Date(entry.startDate) : undefined;
    const endDate = entry.endDate ? new Date(entry.endDate) : undefined;
    return {
      title: entry.title ?? "",
      description: entry.description ?? "",
      tags: (entry.tags ?? []).join(", "),
      pinned: entry.pinned ?? false,
      eventNature: entry.eventNature,
      eventDate: entry.eventDate ? new Date(entry.eventDate) : undefined,
      range: startDate && endDate ? { from: startDate, to: endDate } : undefined,
    };
  }, [entry]);

  const handleUpdate = async (values: EventCreateInput) => {
    await updateEvent.mutateAsync({ ...values, id: entry.id });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/events">
            <ArrowLeft className="h-4 w-4" />
            Back to events
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => togglePin.mutate({ eventId: entry.id })}
          >
            {entry.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="outline">
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Edit event</DialogTitle>
                <DialogDescription>Update the details for this event.</DialogDescription>
              </DialogHeader>
              <EventForm
                defaultValues={defaultValues}
                submitLabel="Save changes"
                isSubmitting={updateEvent.isLoading}
                onSubmit={handleUpdate}
                onCancel={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <DeleteAlertDialog
            type="event"
            handleDelete={() => removeEvent.mutate({ eventId: entry.id })}
          />
        </div>
      </div>

      <Card className="border-border/60 bg-background">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{entry.title}</h1>
            <Badge variant="outline">{status}</Badge>
            {entry.pinned && <Badge variant="secondary">Pinned</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{formatEventRange(entry)}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {entry.description && (
            <p className="text-sm text-muted-foreground">{entry.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {(entry.tags ?? []).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/tasks">Jump to tasks</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventDetail;
