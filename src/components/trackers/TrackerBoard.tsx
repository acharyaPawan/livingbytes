"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlarmClock,
  AlertTriangle,
  Check,
  Clock3,
  Link2,
  Pause,
  Play,
  RefreshCcw,
  Search,
  Sparkles,
} from "lucide-react";
import { differenceInCalendarDays, format, isAfter } from "date-fns";

import { replaceTrackerTasks, updateTrackerStatus } from "@/actions/trackers";
import type { TrackerTaskOption } from "@/data/tracker/tracker";
import type { TrackerWithTasks } from "@/data/tracker/tracker-db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { TaskPicker } from "@/components/trackers/TaskPicker";
import { AddNewTracker } from "@/components/trackers/tracker-ui-component";
import { trackerFrequency } from "@/server/db/schema";

type Props = {
  trackers: TrackerWithTasks;
  taskOptions: TrackerTaskOption[];
};

type TrackerStatusType = "In Progress" | "Not Started Yet" | "Finished" | "Idle";

const statusThemes: Record<
  TrackerStatusType,
  { badge: string; text: string; pill: string }
> = {
  "In Progress": {
    badge: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100",
    text: "text-emerald-900 dark:text-emerald-100",
    pill: "border-emerald-200/70 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/30",
  },
  "Not Started Yet": {
    badge: "bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100",
    text: "text-blue-900 dark:text-blue-100",
    pill: "border-blue-200/80 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/30",
  },
  Finished: {
    badge: "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
    text: "text-slate-900 dark:text-slate-100",
    pill: "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60",
  },
  Idle: {
    badge: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
    text: "text-amber-900 dark:text-amber-100",
    pill: "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20",
  },
};

const formatRange = (start?: Date | string | null, end?: Date | string | null) => {
  if (!start || !end) return "No range";
  const fromDate = typeof start === "string" ? new Date(start) : start;
  const toDate = typeof end === "string" ? new Date(end) : end;
  return `${format(fromDate, "MMM d")} - ${format(toDate, "MMM d, yyyy")}`;
};

const daysLeft = (end?: Date | string | null) => {
  if (!end) return null;
  const endDate = typeof end === "string" ? new Date(end) : end;
  return differenceInCalendarDays(endDate, new Date());
};

export const TrackerBoard = ({ trackers, taskOptions }: Props) => {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<
    "live" | "upcoming" | "finished" | "idle" | "all"
  >("live");
  const [frequencyFilter, setFrequencyFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const summary = useMemo(() => {
    const totals = {
      total: trackers.length,
      live: trackers.filter((t) => t.status === "In Progress").length,
      upcoming: trackers.filter((t) => t.status === "Not Started Yet").length,
      finished: trackers.filter((t) => t.status === "Finished").length,
      idle: trackers.filter((t) => t.status === "Idle").length,
      dueSoon: trackers.filter((t) => {
        const left = daysLeft(t.endOn);
        return typeof left === "number" && left >= 0 && left <= 3;
      }).length,
      linkedTasks: trackers.reduce((acc, t) => acc + (t.tasks?.length ?? 0), 0),
    };
    return totals;
  }, [trackers]);

  const filteredTrackers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return trackers
      .filter((tracker) => {
        if (statusFilter === "live" && tracker.status !== "In Progress") {
          return false;
        }
        if (statusFilter === "upcoming" && tracker.status !== "Not Started Yet") {
          return false;
        }
        if (statusFilter === "finished" && tracker.status !== "Finished") {
          return false;
        }
        if (statusFilter === "idle" && tracker.status !== "Idle") {
          return false;
        }

        if (frequencyFilter !== "all" && tracker.frequency !== frequencyFilter) {
          return false;
        }

        if (!normalizedSearch) return true;

        const searchable = [
          tracker.title,
          tracker.description ?? "",
          tracker.remark ?? "",
          ...tracker.tasks.map((t) => t?.title ?? ""),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(normalizedSearch);
      })
      .sort((a, b) => {
        const aEnd = a.endOn ? new Date(a.endOn).getTime() : 0;
        const bEnd = b.endOn ? new Date(b.endOn).getTime() : 0;
        return aEnd - bEnd;
      });
  }, [frequencyFilter, search, statusFilter, trackers]);

  const handleStatusChange = (id: string, next: TrackerStatusType) => {
    startTransition(async () => {
      const res = await updateTrackerStatus(id, next);
      if (res?.error) {
        toast({
          title: "Update failed",
          description: res.error,
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Tracker updated", description: `Status set to ${next}` });
      router.refresh();
    });
  };

  const handleReplaceTasks = (id: string, taskIds: string[]) => {
    startTransition(async () => {
      const res = await replaceTrackerTasks(id, taskIds);
      if (res?.error) {
        toast({
          title: "Linking failed",
          description: res.error,
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Links refreshed", description: "Tracker now synced with tasks." });
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Tracker control</p>
          <div className="flex items-center gap-2 text-2xl font-semibold">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Trackers & Links</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Align trackers, tasks, and cadence. Status changes sync with your task board.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setFrequencyFilter("all");
              setStatusFilter("live");
              router.refresh();
            }}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset filters
          </Button>
          <AddNewTracker taskOptions={taskOptions} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile label="Live" value={summary.live} />
        <SummaryTile label="Upcoming" value={summary.upcoming} />
        <SummaryTile label="Due soon" value={summary.dueSoon} />
        <SummaryTile label="Finished" value={summary.finished} />
        <SummaryTile label="Idle" value={summary.idle} />
        <SummaryTile label="Total" value={summary.total} />
        <SummaryTile label="Linked tasks" value={summary.linkedTasks} />
      </div>

      <Card className="border-primary/10 bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Tabs value={statusFilter} onValueChange={(val) => setStatusFilter(val as typeof statusFilter)}>
              <TabsList>
                <TabsTrigger value="live">Live</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="finished">Finished</TabsTrigger>
                <TabsTrigger value="idle">Idle</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap items-center gap-3">
              <div className="w-full min-w-[200px] md:w-52">
                <Label className="sr-only" htmlFor="frequency-filter">
                  Frequency filter
                </Label>
                <Select
                  value={frequencyFilter}
                  onValueChange={(val) => setFrequencyFilter(val)}
                >
                  <SelectTrigger id="frequency-filter">
                    <SelectValue placeholder="Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any cadence</SelectItem>
                    {trackerFrequency.enumValues.map((freq) => (
                      <SelectItem key={freq} value={freq}>
                        {freq}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-72">
                <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tracker or task..."
                    className="border-0 bg-transparent p-0 focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredTrackers.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No trackers match these filters yet.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredTrackers.map((tracker) => (
          <TrackerCard
            key={tracker.id}
            tracker={tracker}
            taskOptions={taskOptions}
            onStatusChange={handleStatusChange}
            onReplaceTasks={handleReplaceTasks}
            disabled={isPending}
          />
        ))}
      </div>
    </div>
  );
};

const SummaryTile = ({ label, value }: { label: string; value: number }) => (
  <Card className="border-border/60 bg-background">
    <CardHeader className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </CardHeader>
  </Card>
);

type TrackerCardProps = {
  tracker: TrackerWithTasks[number];
  taskOptions: TrackerTaskOption[];
  onStatusChange: (id: string, status: TrackerStatusType) => void;
  onReplaceTasks: (id: string, taskIds: string[]) => void;
  disabled?: boolean;
};

const TrackerCard = ({
  tracker,
  taskOptions,
  onStatusChange,
  onReplaceTasks,
  disabled,
}: TrackerCardProps) => {
  const [linkSelection, setLinkSelection] = useState<string[]>(
    tracker.tasks?.map((t) => t?.id).filter(Boolean) ?? [],
  );
  const [openPopover, setOpenPopover] = useState(false);
  const statusTheme = statusThemes[tracker.status];
  const endInDays = daysLeft(tracker.endOn);
  const startsLater =
    tracker.startOn && isAfter(new Date(tracker.startOn), new Date());
  const endingSoon = typeof endInDays === "number" && endInDays <= 3 && endInDays >= 0;

  return (
    <Card className="border-border/70 bg-background">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusTheme?.badge}>{tracker.status}</Badge>
              <Badge variant="outline" className="border-dashed">
                {tracker.frequency}
              </Badge>
              {startsLater && (
                <Badge variant="secondary" className="gap-1">
                  <AlarmClock className="h-3 w-3" />
                  Starts {format(new Date(tracker.startOn), "MMM d")}
                </Badge>
              )}
              {endingSoon && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {endInDays} day{endInDays === 1 ? "" : "s"} left
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold">{tracker.title}</h3>
            {tracker.description && (
              <p className="text-sm text-muted-foreground">{tracker.description}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => onStatusChange(tracker.id, "In Progress")}
              className="gap-1"
            >
              <Play className="h-3 w-3" />
              Start
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => onStatusChange(tracker.id, "Idle")}
              className="gap-1"
            >
              <Pause className="h-3 w-3" />
              Idle
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={disabled}
              onClick={() => onStatusChange(tracker.id, "Finished")}
              className="gap-1"
            >
              <Check className="h-3 w-3" />
              Done
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-4 w-4" />
            {formatRange(tracker.startOn, tracker.endOn)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Link2 className="h-4 w-4" />
            {tracker.tasks?.length ?? 0} linked task
            {(tracker.tasks?.length ?? 0) === 1 ? "" : "s"}
          </span>
          {tracker.remark && (
            <span className="inline-flex items-center gap-1 text-foreground">
              Note: {tracker.remark}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Popover open={openPopover} onOpenChange={setOpenPopover}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <Link2 className="h-4 w-4" />
                Manage links
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[360px] space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Link tasks to this tracker</p>
                <Badge variant="secondary">{linkSelection.length} selected</Badge>
              </div>
              <TaskPicker
                options={taskOptions}
                value={linkSelection}
                onChange={setLinkSelection}
                emptyLabel="No tasks found."
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setLinkSelection(
                      tracker.tasks?.map((t) => t?.id).filter(Boolean) ?? [],
                    )
                  }
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    onReplaceTasks(tracker.id, linkSelection);
                    setOpenPopover(false);
                  }}
                >
                  Save links
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          {tracker.tasks && tracker.tasks.length > 0 ? (
            tracker.tasks.map((task) => (
              <div
                key={task?.id}
                className="flex flex-wrap items-start justify-between gap-2 rounded-lg border bg-muted/50 px-3 py-2"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium leading-tight">{task?.title}</p>
                    {task?.status && (
                      <Badge variant="secondary" className="capitalize">
                        {task.status.toLowerCase()}
                      </Badge>
                    )}
                    {task?.priorityLabel && (
                      <Badge variant="outline">{task.priorityLabel}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {task?.categoryTitle ?? "Uncategorized"}
                  </p>
                  {task?.expiresOn && (
                    <p className="text-xs text-muted-foreground">
                      Due {format(new Date(task.expiresOn), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
                {task?.status === "In Progress" && task?.expiresOn && (
                  <div className="flex items-center gap-1 rounded-full border px-2 py-1 text-xs">
                    <Clock3 className="h-3 w-3" />
                    {differenceInCalendarDays(new Date(task.expiresOn), new Date())}d left
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No tasks linked yet. Link one to keep everything in sync.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
