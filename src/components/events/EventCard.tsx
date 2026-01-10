"use client";

import { CalendarDays, Pencil, Pin, PinOff } from "lucide-react";
import Link from "next/link";
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

const statusStyles: Record<string, string> = {
  upcoming: "bg-sky-100 text-sky-700",
  ongoing: "bg-emerald-100 text-emerald-700",
  past: "bg-slate-100 text-slate-600",
};

type Props = {
  entry: EventFeedEntry;
  onUpdated?: (entry: EventFeedEntry) => void;
  onDeleted?: (id: string) => void;
};

export const EventCard = ({ entry, onUpdated, onDeleted }: Props) => {
  const [open, setOpen] = useState(false);
  const status = eventStatus(entry);
  const utils = api.useUtils();

  const togglePin = api.event.togglePin.useMutation({
    onSuccess() {
      void utils.event.list.invalidate();
      void utils.event.summary.invalidate();
    },
  });

  const updateEvent = api.event.update.useMutation({
    onSuccess(data) {
      onUpdated?.(data);
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
      onDeleted?.(entry.id);
      toast({ title: "Event deleted", description: "Removed from your calendar." });
      void utils.event.summary.invalidate();
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
    <Card className="border-border/60 bg-background">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{entry.title}</h3>
              {entry.pinned && <Badge variant="outline">Pinned</Badge>}
              <Badge className={statusStyles[status]}>{status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatEventRange(entry)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => togglePin.mutate({ eventId: entry.id })}
              aria-label={entry.pinned ? "Unpin event" : "Pin event"}
            >
              {entry.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" aria-label="Edit event">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Edit event</DialogTitle>
                  <DialogDescription>Update details, timing, and tags.</DialogDescription>
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
      </CardHeader>
      <CardContent className="space-y-3">
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
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href={`/events/${entry.id}`}>
              <CalendarDays className="h-4 w-4" />
              Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
