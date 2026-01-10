"server-only";

import { redirect } from "next/navigation";

import { getMemoizedSession } from "@/memoize/session";
import type { EventFilters } from "@/shared/event";
import { getCachedEventStats, getEventByIdForUser, getEventPage } from "./event-db";

export const getEventBoardData = async (filters?: EventFilters) => {
  const session = await getMemoizedSession();
  if (!session) {
    redirect("/api/auth/signin");
  }

  const [page, stats] = await Promise.all([
    getEventPage({ userId: session.user.id, limit: 12, filters }),
    getCachedEventStats(session.user.id),
  ]);

  return { page, stats };
};

export const getEventEntry = async (id: string) => {
  const session = await getMemoizedSession();
  if (!session) {
    redirect("/api/auth/signin");
  }

  const entry = await getEventByIdForUser(session.user.id, id);
  if (!entry) {
    redirect("/events");
  }

  return entry;
};

export const getEventPageForUser = async (opts: {
  cursor?: string;
  limit?: number;
  filters?: EventFilters;
}) => {
  const session = await getMemoizedSession();
  if (!session) {
    redirect("/api/auth/signin");
  }

  return getEventPage({
    userId: session.user.id,
    cursor: opts.cursor,
    limit: opts.limit,
    filters: opts.filters,
  });
};

export type EventFeedEntry = Awaited<
  ReturnType<typeof getEventPage>
>["items"][number];
export type { EventStats } from "./event-db";
