"use client";

import { format } from "date-fns";
import {
  CalendarSearch,
  Filter,
  FolderKanban,
  Loader2,
  RefreshCcw,
  Search,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import type { DateRange } from "react-day-picker";
import Link from "next/link";

import type { EventFeedEntry, EventStats } from "@/data/event/event";
import type { EventFilters } from "@/shared/event";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { EventCard } from "@/components/events/EventCard";
import { EventComposer } from "@/components/events/EventComposer";

type Props = {
  initialPage: {
    items: EventFeedEntry[];
    nextCursor?: string | undefined;
  };
  stats: EventStats;
};

const PAGE_SIZE = 12;

export const EventBoard = ({ initialPage, stats }: Props) => {
  const utils = api.useUtils();
  const [entries, setEntries] = useState<EventFeedEntry[]>(initialPage.items ?? []);
  const [cursor, setCursor] = useState<string | undefined>(initialPage.nextCursor);
  const [range, setRange] = useState<DateRange | undefined>();
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [onlyPinned, setOnlyPinned] = useState(false);
  const [typeFilter, setTypeFilter] = useState<EventFilters["type"]>();
  const [statusFilter, setStatusFilter] = useState<EventFilters["status"]>();
  const [isPending, startTransition] = useTransition();

  const filters = useMemo<EventFilters>(
    () => ({
      search: search.trim() || undefined,
      tag: tag.trim() || undefined,
      from: range?.from,
      to: range?.to,
      pinned: onlyPinned || undefined,
      type: typeFilter,
      status: statusFilter,
    }),
    [onlyPinned, range?.from, range?.to, search, statusFilter, tag, typeFilter],
  );

  const refreshWithFilters = () =>
    startTransition(async () => {
      const res = await utils.event.list.fetch({
        limit: PAGE_SIZE,
        cursor: undefined,
        filters,
      });
      setEntries(res.items);
      setCursor(res.nextCursor);
    });

  const resetFilters = () =>
    startTransition(async () => {
      setSearch("");
      setTag("");
      setRange(undefined);
      setOnlyPinned(false);
      setTypeFilter(undefined);
      setStatusFilter(undefined);

      const res = await utils.event.list.fetch({
        limit: PAGE_SIZE,
        cursor: undefined,
        filters: {},
      });
      setEntries(res.items);
      setCursor(res.nextCursor);
    });

  const loadMore = () =>
    startTransition(async () => {
      if (!cursor) return;
      const res = await utils.event.list.fetch({
        limit: PAGE_SIZE,
        cursor,
        filters,
      });
      setEntries((prev) => [...prev, ...res.items]);
      setCursor(res.nextCursor);
    });

  const handleCreated = (entry: EventFeedEntry) => {
    setEntries((prev) => [entry, ...prev]);
  };

  const handleUpdated = (entry: EventFeedEntry) => {
    setEntries((prev) => prev.map((item) => (item.id === entry.id ? entry : item)));
  };

  const handleDeleted = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Events</p>
          <div className="text-2xl font-semibold">Stay ahead of every milestone</div>
          <p className="text-sm text-muted-foreground">
            Track single-day moments or multi-day ranges and keep your tasks aligned.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href="/tasks">
              <FolderKanban className="h-4 w-4" />
              Jump to tasks
            </Link>
          </Button>
          <EventComposer onCreated={handleCreated} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile label="Total events" value={stats.total} />
        <SummaryTile label="Upcoming" value={stats.upcoming} helper="Next up" />
        <SummaryTile label="Ongoing" value={stats.ongoing} helper="Happening now" />
        <SummaryTile label="Pinned" value={stats.pinned} />
        <SummaryTile label="Past" value={stats.past} />
        <SummaryTile
          label="Last update"
          value={stats.lastEventDate ? format(new Date(stats.lastEventDate), "MMM d") : "—"}
          helper={stats.lastEventDate ? "Most recent event" : "No events yet"}
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
                placeholder="Search events, tags, notes"
                className="border-0 bg-transparent p-0 focus-visible:ring-0"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <CalendarSearch className="h-4 w-4" />
                  {range?.from ? (
                    <>
                      {format(range.from, "MMM d")}
                      {range.to ? ` - ${format(range.to, "MMM d")}` : ""}
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
            <div className="flex flex-wrap items-center gap-3">
              <Label className="flex items-center gap-2 text-sm">
                <Switch checked={onlyPinned} onCheckedChange={setOnlyPinned} />
                Pinned only
              </Label>
              <Label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={typeFilter === "Range"}
                  onCheckedChange={(checked) =>
                    setTypeFilter(checked ? "Range" : undefined)
                  }
                />
                Range only
              </Label>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-[1.2fr,1fr]">
            <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
              <Input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Filter by tag"
                className="border-0 bg-transparent p-0 focus-visible:ring-0"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {stats.topTags?.length ? (
                stats.topTags.map((value) => (
                  <Button
                    key={value}
                    variant={tag === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTag(value)}
                  >
                    {value}
                  </Button>
                ))
              ) : (
                <Badge variant="outline">No tags yet</Badge>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" className="gap-2" onClick={refreshWithFilters} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Apply
            </Button>
            <Button size="sm" variant="ghost" onClick={resetFilters} className="gap-2">
              Reset
            </Button>
            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <span>Status:</span>
              {(["upcoming", "ongoing", "past"] as const).map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={statusFilter === value ? "default" : "outline"}
                  onClick={() =>
                    setStatusFilter(statusFilter === value ? undefined : value)
                  }
                  className="h-7 px-2 text-xs"
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {entries.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No events match these filters yet.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {entries.map((entry) => (
          <EventCard
            key={entry.id}
            entry={entry}
            onUpdated={handleUpdated}
            onDeleted={handleDeleted}
          />
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

export default EventBoard;
