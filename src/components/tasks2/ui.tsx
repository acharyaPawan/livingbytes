"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ReactNode, useEffect, useTransition } from "react"
import { ClassNameValue } from "tailwind-merge"


export const ExpandButton = ({buttonLabel}: {buttonLabel: string}) => {
  return (
    <Button>{buttonLabel}</Button>
  )
}


export const ThreeDotsVertical = () => {
  return (
    <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-ellipsis-vertical"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
  )
}




export const PopOverForUI = ({children, popoverTriggerButtonLabel, className} : {children: ReactNode, popoverTriggerButtonLabel: string, className: string}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{popoverTriggerButtonLabel}</Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-80", className)}>
        {children}
      </PopoverContent>
    </Popover>
  )
}



import { useTimer } from 'react-timer-hook';
import { updateStatus } from "@/app/actions"
import { TaskStatus, TaskType } from "@/types/types"

export function MyTimer({ expiryTimestamp, tid, type, currStatus }: {expiryTimestamp: Date, tid: string, type: TaskType, currStatus: TaskStatus}) {
  const [isPending, startTransition] = useTransition()
  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({ expiryTimestamp, onExpire: () => console.warn('onExpire called') });

  useEffect(() => {
    if (currStatus !== "Expired" && totalSeconds <= 0) {
      startTransition(async () => {
        const res = await updateStatus(tid, "Expired", type);
        if (res?.success) {
          console.log("Status successfully updated.", res.success);
        }
        if (res?.error) {
          console.log("Status not updated", res.error);
        }
      });
    }
  }, [totalSeconds, startTransition, tid]);

  // console.log("Seconds remaining: ", totalSeconds)
  const renderTime = () => {
    if (days > 0) {
      return (
        <div className="text-sm">
          <span>{days}d</span>:<span>{hours}h</span>:<span>{minutes}m</span>:<span>{seconds}s</span>
        </div>
      );
    } else if (hours > 0) {
      return (
        <div className="">
          <span>{hours}h</span>:<span>{minutes}m</span>:<span>{seconds}s</span>
        </div>
      );
    } else if (minutes > 0) {
      return (
        <div className="">
          <span>{minutes}m</span>:<span>{seconds}s</span>
        </div>
      );
    } else {
      return (
        <div className="">
          <span>{seconds}s</span>
        </div>
      );
    }
  };

  return (
    <span className="flex align-baseline gap-1">
      {renderTime()}<span> remaining</span>
    </span>
  );
}

