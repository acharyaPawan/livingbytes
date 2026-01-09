"use client";

import { Loader2, RefreshCcw, Sparkles } from "lucide-react";

import { JournalEntryEditor } from "@/components/journals/JournalEntryEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export default function TodaysJournal() {
  const response = api.journal.retrieveTodaysDocument.useQuery();

  if (response.isLoading || !response.data) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-4 w-4 text-primary" />
              Today&apos;s journal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Daily practice</p>
          <div className="flex items-center gap-2 text-xl font-semibold">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Today&apos;s Journal</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Auto-created and ready to capture highlights, blockers, and wins.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => response.refetch()}
          disabled={response.isFetching}
        >
          {response.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      <JournalEntryEditor entry={response.data} highlightToday />
    </div>
  );
}
