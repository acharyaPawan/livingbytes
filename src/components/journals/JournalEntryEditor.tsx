"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  ExternalLink,
  Loader2,
  NotebookPen,
  NotebookText,
} from "lucide-react";
import Link from "next/link";

import type { JournalFeedEntry } from "@/data/journal/journal";
import useDebouncedUpdate from "@/hooks/use-debounced-update";
import { formatJournalDate, formatJournalDateLong } from "@/shared/journal";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

type Props = {
  entry: JournalFeedEntry;
  highlightToday?: boolean;
};

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

export const JournalEntryEditor = ({ entry, highlightToday }: Props) => {
  const [title, setTitle] = useState(entry.title ?? "Untitled entry");
  const [description, setDescription] = useState(entry.description ?? "");
  const [fileUrl, setFileUrl] = useState(entry.fileUrl ?? "");
  const [isMetaSaving, startMetaTransition] = useTransition();
  const [contentStatus, setContentStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  const utils = api.useUtils();
  const updateMutation = api.journal.update.useMutation({
    onError(error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const debouncedContentUpdate = useDebouncedUpdate((content: string) => {
    setContentStatus("saving");
    updateMutation.mutate(
      { id: entry.id, content },
      {
        onSuccess: async () => {
          setContentStatus("saved");
          setTimeout(() => setContentStatus("idle"), 800);
          await utils.journal.summary.invalidate();
        },
      },
    );
  }, 1200);

  const handleMetaUpdate = (payload: { title?: string; description?: string; fileUrl?: string }) => {
    startMetaTransition(async () => {
      try {
        await updateMutation.mutateAsync({
          id: entry.id,
          ...payload,
        });
        await utils.journal.summary.invalidate();
        toast({ title: "Saved", description: "Journal updated." });
      } catch {
        // handled by onError
      }
    });
  };

  const isToday =
    new Date(entry.date).toDateString() === new Date().toDateString();

  const statusLabel = (() => {
    if (contentStatus === "saving") return "Saving…";
    if (contentStatus === "saved") return "Saved";
    return "Idle";
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              {formatJournalDate(entry.date)}
            </Badge>
            {highlightToday && (
              <Badge className="gap-1">
                <BadgeCheck className="h-3 w-3" />
                Today
              </Badge>
            )}
            {!isToday && (
              <Badge variant="outline">Past entry</Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{formatJournalDateLong(entry.date)}</span>
            <span aria-hidden="true">•</span>
            <span>{statusLabel}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href="/journals">
              <ArrowLeft className="h-4 w-4" />
              Back to list
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/tasks">
              <NotebookPen className="h-4 w-4" />
              Tasks
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/trackers">
              <NotebookText className="h-4 w-4" />
              Trackers
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="journal-title">Title</Label>
              <Input
                id="journal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleMetaUpdate({ title })}
                placeholder="Name this entry"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="journal-link">Attachment link</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="journal-link"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  onBlur={() => handleMetaUpdate({ fileUrl })}
                  placeholder="URL to docs or assets"
                />
                {fileUrl && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={fileUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="journal-description">Context</Label>
            <Textarea
              id="journal-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => handleMetaUpdate({ description })}
              placeholder="Key themes, mood, or summary for the day."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {isMetaSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Metadata autosaves on blur.</span>
            </div>
            <span>Content autosaves while you type.</span>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Editor
              onChange={(val) => debouncedContentUpdate(val)}
              initialContent={entry.content ?? undefined}
              editable={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JournalEntryEditor;
