"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import {
  CalendarSearch,
  Filter,
  Loader2,
  RefreshCcw,
  Search,
  Sparkles,
  StickyNote,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";

import type { JournalFeedEntry, JournalStats } from "@/data/journal/journal";
import { journalPreview } from "@/shared/journal";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { JournalCard } from "@/components/journals/JournalCard";
import { JournalComposer } from "@/components/journals/JournalComposer";

type Props = {
  initialPage: {
    items: JournalFeedEntry[];
    nextCursor?: string | null;
  };
  stats: JournalStats;
};

const PAGE_SIZE = 10;

export const JournalBoard = ({ initialPage, stats }: Props) => {
  const router = useRouter();
  const utils = api.useUtils();
  const [entries, setEntries] = useState<JournalFeedEntry[]>(initialPage.items ?? []);
  const [cursor, setCursor] = useState<string | null | undefined>(initialPage.nextCursor);
  const [range, setRange] = useState<DateRange | undefined>();
  const [search, setSearch] = useState("");
  const [hasContent, setHasContent] = useState(false);
  const [hasAttachment, setHasAttachment] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      from: range?.from,
      to: range?.to,
      hasContent,
      hasAttachment,
    }),
    [hasAttachment, hasContent, range?.from, range?.to, search],
  );

  const dedupe = (list: JournalFeedEntry[]) => {
    const map = new Map<string, JournalFeedEntry>();
    list.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  };

  const refreshWithFilters = () =>
    startTransition(async () => {
      const res = await utils.journal.list.fetch({
        limit: PAGE_SIZE,
        cursor: undefined,
        filters,
      });
      setEntries(dedupe(res.items));
      setCursor(res.nextCursor ?? null);
    });

  const resetFilters = () =>
    startTransition(async () => {
      setSearch("");
      setRange(undefined);
      setHasAttachment(false);
      setHasContent(false);

      const res = await utils.journal.list.fetch({
        limit: PAGE_SIZE,
        cursor: undefined,
        filters: {},
      });
      setEntries(dedupe(res.items));
      setCursor(res.nextCursor ?? null);
    });

  const loadMore = () =>
    startTransition(async () => {
      if (!cursor) return;
      const res = await utils.journal.list.fetch({
        limit: PAGE_SIZE,
        cursor,
        filters,
      });
      setEntries((prev) => dedupe([...prev, ...res.items]));
      setCursor(res.nextCursor ?? null);
    });

  const handleCreated = (entry: JournalFeedEntry) => {
    setEntries((prev) => dedupe([entry, ...prev]));
    toast({ title: "Added", description: "New entry added to your feed." });
  };

  const filteredLocal = entries.filter((entry) => {
    if (!filters.search) return true;
    const haystack = [entry.title, entry.description, journalPreview(entry.content)]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(filters.search.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Journals</p>
          <div className="flex items-center gap-2 text-2xl font-semibold">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Story of your work</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Capture daily context, attach artifacts, and keep progress tied to your tasks.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            size="sm"
            onClick={() => router.push("/journals/today")}
          >
            <StickyNote className="h-4 w-4" />
            Today’s page
          </Button>
          <JournalComposer onCreated={handleCreated} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile label="Total entries" value={stats.total} />
        <SummaryTile label="This week" value={stats.weekCount} />
        <SummaryTile label="With content" value={stats.withContent} />
        <SummaryTile label="Streak" value={stats.streak} helper={stats.hasToday ? "Active" : "Start today"} />
        <SummaryTile
          label="Last entry"
          value={stats.lastEntry ? format(new Date(stats.lastEntry), "MMM d") : "—"}
          helper={stats.lastEntry ? "Most recent log" : "No entries yet"}
        />
      </div>

      <Card className="border-primary/10 bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[2fr,1fr,1fr] md:items-center">
            <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title or description"
                className="border-0 bg-transparent p-0 focus-visible:ring-0"
              />
            </div>
            <div className="flex items-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <CalendarSearch className="h-4 w-4" />
                    {range?.from ? (
                      <>
                        {format(range.from, "MMM d")}{" "}
                        {range?.to ? `- ${format(range.to, "MMM d")}` : ""}
                      </>
                    ) : (
                      "Date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Calendar
                    mode="range"
                    selected={range}
                    onSelect={(val) => setRange(val ?? undefined)}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={hasContent}
                  onCheckedChange={setHasContent}
                />
                Has content
              </Label>
              <Label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={hasAttachment}
                  onCheckedChange={setHasAttachment}
                />
                Has attachment
              </Label>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              className="gap-2"
              onClick={refreshWithFilters}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Apply
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={resetFilters}
              className="gap-2"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {filteredLocal.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nothing matches these filters yet.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredLocal.map((entry) => (
          <JournalCard key={entry.id} entry={entry} />
        ))}
      </div>

      {cursor && (
        <div className="flex justify-center">
          <Button onClick={loadMore} disabled={isPending} variant="outline" className="gap-2">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Load more
          </Button>
        </div>
      )}
    </div>
  );
};

const SummaryTile = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: number | string;
  helper?: string;
}) => (
  <Card className="border-border/60 bg-background">
    <CardHeader className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <CardTitle className="text-2xl font-semibold">{value}</CardTitle>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </CardHeader>
  </Card>
);

export default JournalBoard;
