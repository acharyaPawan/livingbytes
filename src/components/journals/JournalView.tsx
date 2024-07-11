"use client";

import { Skeleton } from "@/components/ui/skeleton";
import useDebouncedUpdate from "@/hooks/use-debounced-update";
import { api } from "@/trpc/react";
import dynamic from "next/dynamic";
import { useMemo, useEffect } from "react";

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

  return (
    <div>
      <div>
        <span>Date: </span>
        <span>{journal.date.toDateString()}</span>
        <span>Title: </span>
        <span>{journal.title}</span>
      </div>
          <Editor onChange={debouncedUpdate} initialContent={journal.content} editable={true} />
    </div>
  );
}
