"server-only";

import { redirect } from "next/navigation";

import { getMemoizedSession } from "@/memoize/session";
import type { JournalFilters } from "@/shared/journal";

import {
  getCachedJournalStats,
  getJournalByIdForUser,
  getJournalPage,
  type JournalFeedEntry,
} from "./journal-db";

export const getJournalBoardData = async (filters?: JournalFilters) => {
  const session = await getMemoizedSession();
  if (!session) {
    redirect("/api/auth/signin");
  }

  const [page, stats] = await Promise.all([
    getJournalPage({
      userId: session.user.id,
      limit: 12,
      filters,
    }),
    getCachedJournalStats(session.user.id),
  ]);

  return { page, stats };
};

export const getJournalEntry = async (id: string) => {
  const session = await getMemoizedSession();
  if (!session) {
    redirect("/api/auth/signin");
  }

  const entry = await getJournalByIdForUser(session.user.id, id);
  if (!entry) {
    redirect("/journals");
  }

  return entry;
};

export const getJournalPageForUser = async (opts: {
  cursor?: Date;
  limit?: number;
  filters?: JournalFilters;
}) => {
  const session = await getMemoizedSession();
  if (!session) {
    redirect("/api/auth/signin");
  }

  return getJournalPage({
    userId: session.user.id,
    cursor: opts.cursor,
    limit: opts.limit,
    filters: opts.filters,
  });
};

export type JournalFeedEntry = Awaited<
  ReturnType<typeof getJournalPage>
>["items"][number];
export type { JournalStats } from "./journal-db";
