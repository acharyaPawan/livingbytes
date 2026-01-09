"use client";

import { useEffect, useRef, useState } from "react";

import { fetchMoreJournals } from "@/actions/journals";
import type { JournalFeedEntry } from "@/data/journal/journal";

import JournalCardView from "./JornalCardView";

export default function PostListInfinite({
  initialJournals,
}: {
  initialJournals: JournalFeedEntry[];
}) {
  const [cursor, setCursor] = useState<Date>(new Date());
  const [journals, setJournals] = useState<JournalFeedEntry[]>(initialJournals);
  const [hasMoreJournals, setHasMoreJournals] = useState<boolean>(true);

  const scrollTrigger = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const initialCursorDate =
      initialJournals?.length > 0 && initialJournals[initialJournals.length - 1]?.date
        ? new Date(initialJournals[initialJournals.length - 1]!.date)
        : new Date();
    if (initialCursorDate) {
      setCursor(initialCursorDate);
    }
  }, [initialJournals]);

  useEffect(() => {
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

    return () => {
      if (scrollTrigger.current) {
        observer.unobserve(scrollTrigger.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMoreJournals, cursor]);

  const loadMoreJournals = async () => {
    if (hasMoreJournals) {
      const fetchedJournals: JournalFeedEntry[] = await fetchMoreJournals(cursor);

      if (fetchedJournals.length === 0) {
        setHasMoreJournals(() => false);
        return;
      }

      setJournals((current) => [...current, ...fetchedJournals]);
      const newCursor = journals[journals.length - 1]?.date;
      if (!newCursor) {
        setHasMoreJournals(false);
        return;
      }
      setCursor(new Date(newCursor));
    }
  };

  return (
    <div>
      <div id="scrollArea" className="flex w-56 flex-col gap-2">
        {journals.map((j) => {
          return <JournalCardView key={j.id} journal={j} />;
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
