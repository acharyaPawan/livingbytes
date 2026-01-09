"use client";

import { format } from "date-fns";
import { Check, Clock3, Flag, Layers } from "lucide-react";

import type { TrackerTaskOption } from "@/data/tracker/tracker";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

type TaskPickerProps = {
  value: string[];
  onChange: (next: string[]) => void;
  options: TrackerTaskOption[];
  emptyLabel?: string;
};

export const TaskPicker = ({
  value,
  onChange,
  options,
  emptyLabel = "No tasks available.",
}: TaskPickerProps) => {
  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((taskId) => taskId !== id));
      return;
    }
    onChange([...value, id]);
  };

  return (
    <Command className="rounded-lg border">
      <CommandInput placeholder="Search tasks..." className="px-3" />
      <CommandList>
        <CommandEmpty>{emptyLabel}</CommandEmpty>
        <CommandGroup>
          {options.map((task) => {
            const selected = value.includes(task.id);
            return (
              <CommandItem
                key={task.id}
                onSelect={() => toggle(task.id)}
                className="flex flex-col items-start gap-1 px-3 py-2"
              >
                <div className="flex w-full items-center gap-2">
                  <Check
                    className={cn(
                      "h-4 w-4 text-primary transition",
                      selected ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex-1 font-medium leading-tight">
                    {task.title}
                  </span>
                  <Badge variant="outline" className="capitalize">
                    {task.status.toLowerCase()}
                  </Badge>
                </div>
                <div className="flex w-full flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Flag className="h-3 w-3" />
                    {task.category?.title ?? "Uncategorized"}
                  </span>
                  {task.priorityLabel && (
                    <Badge variant="secondary" className="text-[10px]">
                      {task.priorityLabel} priority
                    </Badge>
                  )}
                  {task.effectiveOn && (
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      Starts {format(new Date(task.effectiveOn), "MMM d")}
                    </span>
                  )}
                  {task.expiresOn && (
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3 w-3" />
                      Due {format(new Date(task.expiresOn), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};
