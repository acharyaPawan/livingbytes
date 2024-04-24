"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function TodaysJournal() {
  const Editor = useMemo(
    () => dynamic(() => import("@/components/Editor"), { ssr: false }),
    [],
  );

  //Fetch Todays Journal
  const response = api.journal.retrieveTodaysDocument.useQuery();

  const update = api.journal.update.useMutation().mutate;

  const journal = response?.data;

  if (response.isLoading || !journal?.content || !journal.id) {
    return (
      <div>
        <div className="mx-auto mt-10 md:max-w-3xl lg:max-w-4xl ">
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

  const onChange = (content: string) => {
    update({
      id: journal.id,
      content: content,
    });
  };

  return (
    <div>
      This is todays Journal
      <div>
          <span>Date: </span>
          <span>{journal.date.toDateString()}     </span>
          <span>Title: </span>
          <span>{journal.title}</span>
        </div>
      <div className="h-auto w-full overflow-y-scroll border-4 border-red-700 bg-['#F8F8F8']">
        <div className="lg:md-max-w-4xl mx-auto md:max-w-3xl">
          <Editor onChange={onChange} initialContent={journal.content} />
        </div>
      </div>
    </div>
  );
}
