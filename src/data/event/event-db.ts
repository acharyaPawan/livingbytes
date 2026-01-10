"server-only";

import { unstable_cache } from "next/cache";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

import db from "@/server/db";
import { events } from "@/server/db/schema";
import {
  type EventFilters,
  eventStatus,
  matchesEventFilters,
  paginateEvents,
  sortEvents,
  eventTags,
} from "@/shared/event";

type EventWithDates = Awaited<
  ReturnType<typeof db.query.events.findMany>
>[number];

export type EventFeedEntry = EventWithDates & {
  eventDate?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;
};

const mapEvent = (event: EventWithDates): EventFeedEntry => ({
  ...event,
  eventDate: event.singleDayEvent?.eventDate ?? null,
  startDate: event.rangeEvent?.startDate ?? null,
  endDate: event.rangeEvent?.endDate ?? null,
});

const baseWhere = (userId: string, filters: EventFilters = {}) => {
  const normalizedSearch = filters.search?.trim();
  const tag = filters.tag?.trim();

  return (event: typeof events) =>
    and(
      eq(event.userId, userId),
      filters.pinned ? eq(event.pinned, true) : undefined,
      filters.type ? eq(event.eventNature, filters.type) : undefined,
      normalizedSearch
        ? or(
            ilike(event.title, `%${normalizedSearch}%`),
            ilike(event.description, `%${normalizedSearch}%`),
            ilike(sql`array_to_string(${event.tags}, ' ')`, `%${normalizedSearch}%`),
          )
        : undefined,
      tag
        ? ilike(sql`array_to_string(${event.tags}, ',')`, `%${tag}%`)
        : undefined,
    );
};

export const getEventPage = async ({
  userId,
  filters = {},
  limit = 12,
  cursor,
}: {
  userId: string;
  filters?: EventFilters;
  limit?: number;
  cursor?: string;
}) => {
  const rows = await db.query.events.findMany({
    where: baseWhere(userId, filters),
    with: {
      singleDayEvent: true,
      rangeEvent: true,
    },
    orderBy: (event, { desc }) => desc(event.createdOn),
  });

  const mapped = rows.map(mapEvent);
  const filtered = mapped.filter((event) => matchesEventFilters(event, filters));
  const sorted = sortEvents(filtered);

  const page = paginateEvents(sorted, limit, cursor);
  return {
    items: page.items,
    nextCursor: page.nextCursor,
  };
};

export const getEventByIdForUser = async (userId: string, eventId: string) => {
  const [entry] = await db.query.events.findMany({
    where: (event, { and, eq }) =>
      and(eq(event.userId, userId), eq(event.id, eventId)),
    with: {
      singleDayEvent: true,
      rangeEvent: true,
    },
    limit: 1,
  });

  if (!entry) return null;
  return mapEvent(entry);
};

export const getCachedEventStats = (userId: string) =>
  unstable_cache(
    async (uid: string) => {
      const rows = await db.query.events.findMany({
        where: (event, { eq }) => eq(event.userId, uid),
        with: {
          singleDayEvent: true,
          rangeEvent: true,
        },
        orderBy: (event, { desc }) => desc(event.createdOn),
      });

      const mapped = rows.map(mapEvent);
      const total = mapped.length;
      const pinned = mapped.filter((event) => event.pinned).length;
      const upcoming = mapped.filter((event) => eventStatus(event) === "upcoming").length;
      const ongoing = mapped.filter((event) => eventStatus(event) === "ongoing").length;
      const past = mapped.filter((event) => eventStatus(event) === "past").length;
      const lastEventDate = mapped[0]?.createdOn ?? null;
      const tagCounts = mapped.flatMap((event) => event.tags ?? []);
      const tagFrequency = tagCounts.reduce<Record<string, number>>((acc, tag) => {
        acc[tag] = (acc[tag] ?? 0) + 1;
        return acc;
      }, {});
      const topTags = Object.entries(tagFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag);

      return {
        total,
        pinned,
        upcoming,
        ongoing,
        past,
        lastEventDate,
        topTags,
      };
    },
    ["event-stats", userId],
    { tags: eventTags(userId) },
  )(userId);

export type EventStats = Awaited<ReturnType<typeof getCachedEventStats>>;
