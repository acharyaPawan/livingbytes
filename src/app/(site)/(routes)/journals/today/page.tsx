"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import useDebouncedUpdate from "@/hooks/use-debounced-update";
import { api } from "@/trpc/react";
import dynamic from "next/dynamic";
import { useMemo, useEffect } from "react";

export default function TodaysJournal() {
  const Editor = useMemo(
    () => dynamic(() => import("@/components/Editor"), { ssr: false }),
    [],
  );

  // Fetch Today's Journal
  const response = api.journal.retrieveTodaysDocument.useQuery();
  const update = api.journal.update.useMutation().mutate;
  const journal = response?.data;

  const handleDebouncedUpdate = (newContent: string) => {
    if (journal?.id) {
      update({
        id: journal?.id,
        content: newContent,
      });
    }
  };

  const debouncedUpdate = useDebouncedUpdate(handleDebouncedUpdate, 5000);

  if (response.isLoading || !journal) {
    return (
      <div>
        <div className="mx-auto mt-10 md:max-w-3xl lg:max-w-4xl">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-14 w-[80%]" />
            <Skeleton className="h-14 w-[40%]" />
            <Skeleton className="h-14 w-[60%]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span>Date: </span>
        <span>{journal.date.toDateString()}</span>
        <span>Title: </span>
        <span>{journal.title}</span>
        <span>editable: <Badge variant={"secondary"}>true</Badge></span>
      </div>
      <Editor
        onChange={debouncedUpdate}
        initialContent={journal?.content ?? "Loading..."}
        editable={true}
      />
    </div>
  );
}
