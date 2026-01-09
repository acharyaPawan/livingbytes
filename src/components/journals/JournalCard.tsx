"use client";

import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, NotebookPen, Paperclip, ScrollText } from "lucide-react";

import type { JournalFeedEntry } from "@/data/journal/journal";
import { formatJournalDate, journalPreview } from "@/shared/journal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  entry: JournalFeedEntry;
};

export const JournalCard = ({ entry }: Props) => {
  const preview = journalPreview(entry.content);
  const hasContent = !!preview;
  const hasAttachment = !!entry.fileUrl;

  return (
    <Card className="border-border/70 bg-background">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary" className="gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatJournalDate(entry.date)}
          </Badge>
          <div className="flex items-center gap-2">
            {hasAttachment && (
              <Badge variant="outline" className="gap-1">
                <Paperclip className="h-3 w-3" />
                Attachment
              </Badge>
            )}
            {hasContent ? (
              <Badge variant="default" className="gap-1">
                <ScrollText className="h-3 w-3" />
                Updated
              </Badge>
            ) : (
              <Badge variant="outline">Empty draft</Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-lg font-semibold">
          {entry.title ?? "Untitled entry"}
        </CardTitle>
        {entry.description && (
          <p className="text-sm text-muted-foreground">{entry.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {preview || "No content written yet—jump in and add your notes."}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>
            {format(new Date(entry.date), "PPPP")} ·{" "}
            {hasContent ? "Editable" : "Draft"}
          </span>
          {entry.fileUrl && (
            <a
              href={entry.fileUrl}
              className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              <Paperclip className="h-3 w-3" />
              Attachment
            </a>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm" className="gap-2">
            <Link href={`/journals/${entry.id}`}>
              <NotebookPen className="h-4 w-4" />
              Open
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/journals/today">Today&apos;s entry</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default JournalCard;
