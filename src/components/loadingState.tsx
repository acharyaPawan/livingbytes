"use client"

import { Skeleton } from "./ui/skeleton";

const loadingState = (
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

export default loadingState