"use client";

import { Skeleton } from "@/components/ui/skeleton";
import useDebouncedUpdate from "@/hooks/use-debounced-update";
import { getEndOfDay, getEndOfDayISOString, getStartOfDay } from "@/lib/utils";
import { api } from "@/trpc/react";
import dynamic from "next/dynamic";
import { useMemo, useEffect } from "react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import InputWithButton from "./InputForTitle";

export default function JournalViewById({journal}: {journal: any}) {
  const Editor = useMemo(
    () => dynamic(() => import("@/components/Editor"), { ssr: false }),
    [],
  );

  const update = api.journal.update.useMutation().mutate;


  const handleDebouncedUpdate = (newContent: string) => {
    if (journal?.id) {
        update({
          id: journal?.id,
          content: newContent,
        });
      }
  }

  const debouncedUpdate = useDebouncedUpdate(handleDebouncedUpdate, 5000);
  // console.log(journal.date)

  const editable = !!(journal.date > getStartOfDay().valueOf())
  // console.log("editable status: ", editable)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col flex-1 gap-1">
        <span>Date: {journal.date.toDateString()}</span>
        <InputWithButton>Title: </InputWithButton>
        <span>{journal.title}</span>
        <span>editable: {editable? <Badge variant={"secondary"}>true</Badge>: <Badge variant={"destructive"}>false</Badge>}</span>
      </div>
          <Editor onChange={debouncedUpdate} initialContent={journal.content} editable={editable} />
    </div>
  );
}
