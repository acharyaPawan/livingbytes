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

export function MyTimer({ expiryTimestamp, tid, type, effectiveTimestamp, currStatus }: {effectiveTimestamp?: Date, expiryTimestamp: Date, tid: string, type: TaskType, currStatus: TaskStatus}) {
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
  } = useTimer({ expiryTimestamp, onExpire: () => console.warn('onExpire called'), autoStart: true });


  // useEffect(() => {
  //   // const time = new Date()
  //   restart(expiryTimestamp)
  // }, [])

  useEffect(() => {
    if (currStatus !== "Paused" && new Date() < expiryTimestamp) {
      restart(expiryTimestamp)
    }
    if (currStatus === "In Progress" && (totalSeconds <= 0)) {
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
    if (currStatus === "Scheduled" && (totalSeconds <= 0)) {
      startTransition(async () => {
        const res = await updateStatus(tid, "In Progress", type);
        if (res?.success) {
          console.log("Status successfully updated.", res.success);
        }
        if (res?.error) {
          console.log("Status not updated", res.error);
        }
      });
    }
    if (currStatus === "Paused") {
      pause()
    }
    if (currStatus === "Scheduled" && effectiveTimestamp && effectiveTimestamp > new Date()) {
      restart(effectiveTimestamp)
    }
  }, [totalSeconds, startTransition, tid, currStatus, expiryTimestamp, type, ]);

  const renderTotalSeconds = () => {
    return (<div className="text-sm">{totalSeconds}</div>)
  }

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
    <>
    {<span className="flex align-baseline gap-1">
      {renderTime()}<span> remaining</span>{currStatus === "Scheduled" && <span> to start</span>}
    </span>}
    </>
  );
}



// FormSuccess.jsx

export const FormSuccess = ({ message }: {message: string}) => {
  return (
    <div className="flex items-center justify-between p-4 mb-4 text-green-800 bg-green-100 rounded-lg border border-green-300" role="alert">
      <svg className="w-5 h-5 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
      <span>{message}</span>
    </div>
  );
};

export const FormError = ({ message }: {message: string}) => {
  return (
    <div className="flex items-center justify-between p-4 mb-4 text-red-800 bg-red-100 rounded-lg border border-red-300" role="alert">
      <svg className="w-5 h-5 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12.082a9.985 9.985 0 00-1.638-4.118A9.979 9.979 0 0012 4a9.979 9.979 0 00-7.362 3.964A9.985 9.985 0 003 12.082 9.979 9.979 0 0012 20a9.979 9.979 0 007.362-3.964A9.985 9.985 0 0021 12.082z" />
      </svg>
      <span>{message}</span>
    </div>
  );
};



