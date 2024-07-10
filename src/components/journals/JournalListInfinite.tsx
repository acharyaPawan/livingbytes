"use client";

import { fetchMoreJournals } from "@/actions/journals";
import { type JournalType } from "@/app/(site)/(routes)/journal/page";
import { useEffect, useRef, useState } from "react";
import JournalCardView from "./JornalCardView";

export default function PostListInfinite({
  initialJournals,
}: {
  initialJournals: JournalType[];
}) {
  const [cursor, setCursor] = useState<Date>(new Date());
  const [journals, setJournals] = useState<JournalType[]>(initialJournals);
  const [hasMoreJournals, setHasMoreJournals] = useState<boolean>(true);

  const scrollTrigger = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // setting up initialCursor
    const initialCursorDate =
      initialJournals?.length > 0 && initialJournals[initialJournals.length - 1]?.date
        ? initialJournals[initialJournals.length - 1]?.date
        : new Date();
    if (typeof initialCursorDate !== "undefined") {
      setCursor(initialCursorDate);
    }
  }, [initialJournals]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    if (!window?.IntersectionObserver) {
      return;
    }

    const options = {
      root: document.querySelector("#scrollArea"),
      rootMargin: "0px",
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        if (hasMoreJournals) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          loadMoreJournals(); // Await here
        }
      }
    }, options);

    if (scrollTrigger.current) {
      observer.observe(scrollTrigger.current);
    }

    // Cleanup
    return () => {
      if (scrollTrigger.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(scrollTrigger.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMoreJournals, cursor]);

  const loadMoreJournals = async () => {
    if (hasMoreJournals) {
      const fetchedJournals: JournalType[] = await fetchMoreJournals(cursor);
      console.log("fetched inside");

      if (fetchMoreJournals.length === 0) {
        setHasMoreJournals(() => false);
        return;
      }

      setJournals((journals) => [...journals, ...fetchedJournals]);
      //update cursor
      const newCursor = journals[journals.length - 1]?.date;
      if (typeof newCursor === "undefined" || newCursor === undefined) {
        console.log("cursor is undefined");
        setHasMoreJournals(false);
        return;
      }
      setCursor(newCursor);
    }
  };

  return (
    <div>
      <div id="scrollArea" className="flex flex-col gap-2 w-56">
        {journals.map((j) => {
          return <JournalCardView key={j.id} Journal={j} />;
        })}
        <div className="...">
          {hasMoreJournals ? (
            <div ref={scrollTrigger}>Loading...</div>
          ) : (
            <p className="text-red-400">No more posts to load</p>
          )}
        </div>
      </div>
    </div>
  );
}
