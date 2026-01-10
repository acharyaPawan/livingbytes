"use client";

import type { ReactNode } from "react";
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlarmClock,
  AlertTriangle,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  Flag,
  LayoutGrid,
  Link2,
  List,
  Pause,
  Play,
  RefreshCcw,
  Search,
  Hash,
} from "lucide-react";

import { updateStatus, deleteFunctionality } from "@/app/actions";
import { AddNew } from "@/components/tasks/AddNew";
import { MyTimer } from "@/components/tasks2/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import type { categoriesWithTasksType } from "@/data/task/task-db";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/utils/misc";
import type { PriorityLabels, TaskStatus } from "@/types/types";

type StatusPreset = "live" | "scheduled" | "finished" | "overdue" | "all";

type TaskBoardProps = {
  categories: categoriesWithTasksType;
};

type TaskCardData = categoriesWithTasksType[number]["tasks"][number];

const STATUS_PRESET_MAP: Record<StatusPreset, TaskStatus[]> = {
  live: ["Not Started", "In Progress", "Paused"],
  scheduled: ["Scheduled"],
  finished: ["Finished"],
  overdue: ["Expired"],
  all: [],
};

const STATUS_THEME: Record<
  TaskStatus,
  { badge: string; text: string; border: string; icon?: ReactNode }
> = {
  "Not Started": {
    badge: "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
    text: "text-slate-700 dark:text-slate-200",
    border: "border-slate-200 dark:border-slate-800",
  },
  "In Progress": {
    badge: "bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100",
    text: "text-blue-900 dark:text-blue-100",
    border: "border-blue-200/80 dark:border-blue-900/60",
  },
  Paused: {
    badge: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
    text: "text-amber-900 dark:text-amber-100",
    border: "border-amber-200/80 dark:border-amber-900/50",
  },
  Finished: {
    badge: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100",
    text: "text-emerald-900 dark:text-emerald-100",
    border: "border-emerald-200/80 dark:border-emerald-900/50",
  },
  Scheduled: {
    badge: "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-100",
    text: "text-indigo-900 dark:text-indigo-100",
    border: "border-indigo-200/80 dark:border-indigo-900/50",
  },
  Expired: {
    badge: "bg-rose-100 text-rose-900 dark:bg-rose-900/50 dark:text-rose-100",
    text: "text-rose-900 dark:text-rose-100",
    border: "border-rose-200/70 dark:border-rose-900/50",
  },
};

const PRIORITY_THEME: Record<PriorityLabels, string> = {
  "Very High": "bg-rose-100 text-rose-900 dark:bg-rose-900/50 dark:text-rose-100",
  High: "bg-orange-100 text-orange-900 dark:bg-orange-900/50 dark:text-orange-100",
  Moderate: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  Less: "bg-sky-100 text-sky-900 dark:bg-sky-900/50 dark:text-sky-100",
  "Very Less": "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
};

const formatDate = (value?: string | Date | null, withTime = false) => {
  if (!value) return "Not set";
  const parsed = typeof value === "string" ? new Date(value) : value;
  return parsed.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: withTime ? "short" : undefined,
  });
};

const getBucket = (status: TaskStatus): keyof ReturnType<typeof getEmptyBuckets> => {
  if (status === "Scheduled") return "scheduled";
  if (status === "Expired") return "overdue";
  if (status === "Finished") return "finished";
  return "active";
};

const getEmptyBuckets = () => ({
  active: [] as TaskCardData[],
  scheduled: [] as TaskCardData[],
  overdue: [] as TaskCardData[],
  finished: [] as TaskCardData[],
});

const useBoardModel = (
  categories: categoriesWithTasksType,
  preset: StatusPreset,
  search: string,
  priorityFilter: PriorityLabels | "all",
) => {
  const flattened = useMemo(() => {
    return categories.flatMap((category) =>
      category.tasks.map((task) => ({
        ...task,
        categoryTitle: task.categoryTitle ?? category.title,
      })),
    );
  }, [categories]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const allowedStatuses = STATUS_PRESET_MAP[preset];

    return flattened
      .filter((task) => {
        if (allowedStatuses.length && !allowedStatuses.includes(task.status)) {
          return false;
        }

        if (priorityFilter !== "all" && task.priorityLabel !== priorityFilter) {
          return false;
        }

        if (!normalizedSearch) return true;
        const searchableFields = [
          task.title,
          task.description ?? "",
          task.remark ?? "",
          task.categoryTitle ?? "",
        ];

        return searchableFields.some((field) =>
          field.toLowerCase().includes(normalizedSearch),
        );
      })
      .sort((a, b) => {
        const aDue = a.expiresOn ? new Date(a.expiresOn).getTime() : 0;
        const bDue = b.expiresOn ? new Date(b.expiresOn).getTime() : 0;
        return aDue - bDue;
      });
  }, [flattened, preset, priorityFilter, search]);

  const buckets = useMemo(() => {
    const group = getEmptyBuckets();
    filtered.forEach((task) => group[getBucket(task.status)].push(task));
    return group;
  }, [filtered]);

  const summary = useMemo(() => {
    const totals = {
      total: flattened.length,
      live: flattened.filter((t) => getBucket(t.status) === "active").length,
      scheduled: flattened.filter((t) => t.status === "Scheduled").length,
      overdue: flattened.filter((t) => t.status === "Expired").length,
      finished: flattened.filter((t) => t.status === "Finished").length,
      locked: flattened.filter((t) => !!t.locked).length,
    };
    return totals;
  }, [flattened]);

  return { filtered, buckets, summary };
};

export const TaskBoard = ({ categories }: TaskBoardProps) => {
  const router = useRouter();
  const [preset, setPreset] = useState<StatusPreset>("live");
  const [priorityFilter, setPriorityFilter] = useState<PriorityLabels | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"board" | "table">("board");

  const { buckets, summary, filtered } = useBoardModel(
    categories,
    preset,
    search,
    priorityFilter,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Task control center
          </p>
          <div className="text-2xl font-semibold">Tasks - Focus Mode</div>
          <p className="text-sm text-muted-foreground">
            Keep active work visible, scheduled items ready, and overdue items honest.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setPriorityFilter("all");
              setPreset("live");
              router.refresh();
            }}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset filters
          </Button>
          <AddNew />
        </div>
      </div>

      <SummaryRow summary={summary} />

      <Card className="border-primary/10 bg-muted/50">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Tabs value={preset} onValueChange={(value) => setPreset(value as StatusPreset)}>
              <TabsList>
                <TabsTrigger value="live">Live</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
                <TabsTrigger value="finished">Finished</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                <LayoutGrid
                  className={cn(
                    "h-4 w-4 cursor-pointer",
                    viewMode === "board" && "text-primary",
                  )}
                  onClick={() => setViewMode("board")}
                />
                <Separator orientation="vertical" className="h-6" />
                <List
                  className={cn(
                    "h-4 w-4 cursor-pointer",
                    viewMode === "table" && "text-primary",
                  )}
                  onClick={() => setViewMode("table")}
                />
              </div>
              <div className="w-full min-w-[220px] md:w-64">
                <Label className="sr-only" htmlFor="priority-filter">
                  Priority filter
                </Label>
                <Select
                  value={priorityFilter}
                  onValueChange={(val) => setPriorityFilter(val as PriorityLabels | "all")}
                >
                  <SelectTrigger id="priority-filter" className="w-full">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any priority</SelectItem>
                    <SelectItem value="Very High">Very High</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Less">Less</SelectItem>
                    <SelectItem value="Very Less">Very Less</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-72">
                <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search title, category, remark..."
                    className="border-0 bg-transparent p-0 focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "board" ? (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
              <TaskColumn
                title="Live now"
                description="Not started, in progress, or paused."
                tasks={buckets.active}
                accent="from-blue-500/10 via-blue-500/5 to-transparent"
              />
              <TaskColumn
                title="Scheduled"
                description="Planned start times with countdowns."
                tasks={buckets.scheduled}
                accent="from-indigo-500/10 via-indigo-500/5 to-transparent"
              />
              <TaskColumn
                title="Overdue"
                description="Expired or blocked tasks."
                tasks={buckets.overdue}
                accent="from-rose-500/10 via-rose-500/5 to-transparent"
              />
              <TaskColumn
                title="Finished"
                description="Completed work, ready to archive."
                tasks={buckets.finished}
                accent="from-emerald-500/10 via-emerald-500/5 to-transparent"
              />
            </div>
          ) : (
            <TaskTable tasks={filtered} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const SummaryRow = ({
  summary,
}: {
  summary: { total: number; live: number; scheduled: number; overdue: number; finished: number; locked: number };
}) => {
  const tiles = [
    {
      label: "In play",
      value: summary.live,
      icon: <Play className="h-4 w-4" />,
    },
    {
      label: "Scheduled",
      value: summary.scheduled,
      icon: <Clock3 className="h-4 w-4" />,
    },
    {
      label: "Overdue",
      value: summary.overdue,
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    {
      label: "Finished",
      value: summary.finished,
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
      label: "Locked",
      value: summary.locked,
      icon: <Flag className="h-4 w-4" />,
    },
    {
      label: "Total",
      value: summary.total,
      icon: <Hash className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {tiles.map((tile) => (
        <Card key={tile.label} className="border-border/60 bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">{tile.label}</p>
            <div className="rounded-full bg-muted p-2 text-muted-foreground">{tile.icon}</div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{tile.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const TaskColumn = ({
  title,
  description,
  tasks,
  accent,
}: {
  title: string;
  description: string;
  tasks: TaskCardData[];
  accent: string;
}) => {
  return (
    <div className={cn("rounded-xl border bg-gradient-to-b", accent)}>
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{description}</p>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>
      <Separator />
      <div className="divide-y divide-border/60">
        {tasks.length === 0 && (
          <div className="px-4 py-6 text-sm text-muted-foreground">
            Nothing here yet. Create or move tasks into this lane.
          </div>
        )}
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

const TaskCard = ({ task }: { task: TaskCardData }) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 px-4 py-3 transition hover:bg-background/60",
        STATUS_THEME[task.status]?.border ?? "border-border",
      )}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={STATUS_THEME[task.status].badge}>{task.status}</Badge>
            {task.priorityLabel && (
              <Badge className={PRIORITY_THEME[task.priorityLabel]}>
                {task.priorityLabel} priority
              </Badge>
            )}
            <Badge variant="outline" className="border-dashed">
              {task.viewAs === "Checkbox" ? "Checklist" : "Status board"}
            </Badge>
          </div>
          <p className="text-base font-semibold leading-tight">{task.title}</p>
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              Due {formatDate(task.expiresOn, true)}
            </span>
            {task.effectiveOn && (
              <span className="inline-flex items-center gap-1">
                <AlarmClock className="h-3.5 w-3.5" />
                Starts {formatDate(task.effectiveOn, true)}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Flag className="h-3.5 w-3.5" />
              {task.categoryTitle}
            </span>
            {task.locked && (
              <Badge variant="outline" className="border-amber-300 text-amber-700">
                Locked
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {["In Progress", "Paused", "Scheduled"].includes(task.status) && task.expiresOn && (
            <MyTimer
              expiryTimestamp={new Date(task.expiresOn)}
              tid={task.id}
              type={"tasks"}
              currStatus={task.status}
              effectiveTimestamp={
                task.status === "Scheduled" && task.effectiveOn
                  ? new Date(task.effectiveOn)
                  : undefined
              }
            />
          )}
          <TaskQuickActions task={task} />
        </div>
      </div>
      {task.subtasks && (
        <div className="rounded-lg border bg-background/60 p-2">
          <div className="mb-1 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>Subtasks ({task.subtasks.length})</span>
            <AddNew subtask={{ taskId: task.id }} />
          </div>
          {task.subtasks.length === 0 && (
            <p className="text-xs text-muted-foreground">No subtasks yet—add your first checkpoint.</p>
          )}
          {task.subtasks.length > 0 && (
            <div className="space-y-2">
              {task.subtasks.slice(0, 4).map((subtask) => (
                <div key={subtask.id} className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {subtask.status}
                    </Badge>
                    <p className="text-sm font-medium">{subtask.title}</p>
                    {subtask.priorityLabel && (
                      <Badge className={PRIORITY_THEME[subtask.priorityLabel]}>
                        {subtask.priorityLabel}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {subtask.categoryTitle ?? "Uncategorized"}
                  </p>
                </div>
              ))}
              {task.subtasks.length > 4 && (
                <p className="text-xs text-muted-foreground">
                  +{task.subtasks.length - 4} more subtasks
                </p>
              )}
            </div>
          )}
        </div>
      )}
      {task.trackers && task.trackers.length > 0 && (
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Trackers</span>
            <Button asChild size="sm" variant="ghost" className="gap-1 px-2 py-0 text-[11px]">
              <Link href="/trackers">
                <Link2 className="h-3 w-3" />
                Open board
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {task.trackers.map((tracker) => (
              <Badge key={tracker?.id} variant="outline" className="gap-1">
                <Clock3 className="h-3 w-3" />
                {tracker?.title}
                {tracker?.status && (
                  <span className="rounded-full bg-muted px-1 text-[10px] text-foreground">
                    {tracker.status}
                  </span>
                )}
                {tracker?.frequency && (
                  <span className="text-[10px] text-muted-foreground">
                    {tracker.frequency}
                  </span>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {task.remark && (
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Remark:</span> {task.remark}
        </p>
      )}
    </div>
  );
};

const TaskQuickActions = ({ task }: { task: TaskCardData }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const runAction = (nextStatus: TaskStatus) => {
    startTransition(async () => {
      const res = await updateStatus(task.id, nextStatus, "tasks");
      if (res?.error) {
        toast({
          title: "Could not update task",
          description: res.error.toString(),
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Status updated",
        description: `${task.title} → ${nextStatus}`,
      });
      router.refresh();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteFunctionality(task.id, "tasks");
      if (res?.error) {
        toast({
          title: "Delete failed",
          description: getErrorMessage(res.error),
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Task removed",
        description: task.title,
      });
      router.refresh();
    });
  };

  const canStart = ["Not Started", "Paused", "Scheduled"].includes(task.status);
  const canPause = task.status === "In Progress";
  const canFinish = ["In Progress", "Paused"].includes(task.status);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={!canStart || isPending}
        onClick={() => runAction("In Progress")}
        className="gap-1"
      >
        <Play className="h-3.5 w-3.5" />
        Start
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!canPause || isPending}
        onClick={() => runAction("Paused")}
        className="gap-1"
      >
        <Pause className="h-3.5 w-3.5" />
        Pause
      </Button>
      <Button
        variant="secondary"
        size="sm"
        disabled={!canFinish || isPending}
        onClick={() => runAction("Finished")}
        className="gap-1"
      >
        <Check className="h-3.5 w-3.5" />
        Done
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={handleDelete}
        className="text-rose-600 hover:text-rose-700 dark:text-rose-400"
      >
        Delete
      </Button>
    </div>
  );
};

const TaskTable = ({ tasks }: { tasks: TaskCardData[] }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-muted-foreground">
          <tr className="border-b">
            <th className="p-2 font-medium">Task</th>
            <th className="p-2 font-medium">Status</th>
            <th className="p-2 font-medium">Priority</th>
            <th className="p-2 font-medium">Category</th>
            <th className="p-2 font-medium">Due</th>
            <th className="p-2 font-medium">Subtasks</th>
            <th className="p-2 font-medium">Trackers</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {tasks.map((task) => (
            <tr key={task.id} className="align-top">
              <td className="p-2">
                <div className="flex flex-col">
                  <span className="font-semibold">{task.title}</span>
                  <span className="text-xs text-muted-foreground">{task.description}</span>
                </div>
              </td>
              <td className="p-2">
                <Badge className={STATUS_THEME[task.status].badge}>{task.status}</Badge>
              </td>
              <td className="p-2">
                {task.priorityLabel ? (
                  <Badge className={PRIORITY_THEME[task.priorityLabel]}>
                    {task.priorityLabel}
                  </Badge>
                ) : (
                  "–"
                )}
              </td>
              <td className="p-2">{task.categoryTitle}</td>
              <td className="p-2">{formatDate(task.expiresOn, true)}</td>
              <td className="p-2">{task.subtasks?.length ?? 0}</td>
              <td className="p-2">{task.trackers?.length ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskBoard;
