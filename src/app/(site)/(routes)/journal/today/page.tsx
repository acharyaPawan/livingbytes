"use client";

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

  const [content, debouncedUpdate] = useDebouncedUpdate((newContent: string) => {
    if (journal?.id) {
    update({
      id: journal?.id,
      content: newContent,
    });
  }
  }, 10000);

  // Initialize content when journal data is fetched
  useEffect(() => {
    if (journal?.content) {
      debouncedUpdate(journal.content);
    }
  }, [journal, debouncedUpdate]);

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
    <div>
      <div>
        <span>Date: </span>
        <span>{journal.date.toDateString()}</span>
        <span>Title: </span>
        <span>{journal.title}</span>
      </div>
      {/* <div className="overflow-y-scroll border-4 border-red-700 bg-['#F8F8F8']">
        <div className="lg:md-max-w-4xl mx-auto md:max-w-3xl h-96 p-6">  */}
          <Editor onChange={debouncedUpdate} initialContent={content} />
        {/* </div>
      </div> */}
    </div>
  );
}
