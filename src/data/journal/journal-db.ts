"server-only";

import { addDays, endOfDay, startOfDay } from "date-fns";
import { unstable_cache } from "next/cache";
import { and, desc, eq, gte, ilike, isNotNull, lt, lte, or, sql } from "drizzle-orm";

import db from "@/server/db";
import { journals } from "@/server/db/schema";
import {
  type JournalFilters,
  journalDateRange,
  journalTags,
} from "@/shared/journal";

const buildWhere = (userId: string, filters: JournalFilters = {}, cursor?: Date) => {
  const normalizedSearch = filters.search?.trim();
  const range = journalDateRange({ from: filters.from, to: filters.to });

  return (journal: typeof journals) =>
    and(
      eq(journal.userId, userId),
      cursor ? lt(journal.date, cursor) : undefined,
      range?.from ? gte(journal.date, range.from) : undefined,
      range?.to ? lte(journal.date, range.to) : undefined,
      filters.hasAttachment ? isNotNull(journal.fileUrl) : undefined,
      filters.hasContent ? sql`length(${journal.content}) > 2` : undefined,
      normalizedSearch
        ? or(
            ilike(journal.title, `%${normalizedSearch}%`),
            ilike(journal.description, `%${normalizedSearch}%`),
            ilike(sql`coalesce(${journal.content}, '')`, `%${normalizedSearch}%`),
          )
        : undefined,
    );
};

export const getCachedJournalFeed = (userId: string, filters: JournalFilters = {}, limit = 12) =>
  unstable_cache(
    async (uid: string, appliedFilters: JournalFilters, appliedLimit: number) => {
      return db.query.journals.findMany({
        where: buildWhere(uid, appliedFilters),
        orderBy: (journal, { desc }) => desc(journal.date),
        columns: {
          id: true,
          title: true,
          description: true,
          content: true,
          date: true,
          userId: true,
          fileUrl: true,
        },
        limit: appliedLimit,
      });
    },
    ["journal-feed", userId, JSON.stringify(filters), String(limit)],
    { tags: journalTags(userId) },
  )(userId, filters, limit);

export const getJournalPage = async ({
  userId,
  cursor,
  limit = 10,
  filters = {},
}: {
  userId: string;
  cursor?: Date;
  limit?: number;
  filters?: JournalFilters;
}) => {
  const rows = await db.query.journals.findMany({
    where: buildWhere(userId, filters, cursor),
    orderBy: (journal, { desc }) => desc(journal.date),
    limit: limit + 1,
  });

  let nextCursor: Date | undefined;
  if (rows.length > limit) {
    const next = rows.pop();
    nextCursor = next?.date ? new Date(next.date) : undefined;
  }

  return {
    items: rows,
    nextCursor,
  };
};

export const getJournalByIdForUser = async (userId: string, id: string) => {
  const [entry] = await db
    .select()
    .from(journals)
    .where(and(eq(journals.id, id), eq(journals.userId, userId)));

  return entry ?? null;
};

export const getCachedJournalStats = (userId: string) =>
  unstable_cache(
    async (uid: string) => {
      const entries = await db.query.journals.findMany({
        where: (journal, { eq }) => eq(journal.userId, uid),
        columns: {
          id: true,
          date: true,
          content: true,
        },
        orderBy: (journal, { desc }) => desc(journal.date),
      });

      const todayStart = startOfDay(new Date()).getTime();
      const weekStart = startOfDay(addDays(new Date(), -7)).getTime();

      const normalizedDates = Array.from(
        new Set(entries.map((entry) => startOfDay(new Date(entry.date)).getTime())),
      ).sort((a, b) => b - a);

      let streak = 0;
      let pointer = todayStart;
      while (normalizedDates.includes(pointer)) {
        streak += 1;
        pointer = startOfDay(addDays(new Date(pointer), -1)).getTime();
      }

      const hasToday = normalizedDates.includes(todayStart);
      const weekCount = entries.filter(
        (entry) => startOfDay(new Date(entry.date)).getTime() >= weekStart,
      ).length;

      const withContent = entries.filter(
        (entry) => entry.content && entry.content.length > 2,
      ).length;

      return {
        total: entries.length,
        withContent,
        weekCount,
        streak,
        hasToday,
        lastEntry: entries[0]?.date ?? null,
      };
    },
    ["journal-stats", userId],
    { tags: journalTags(userId) },
  )(userId);

export type JournalFeedEntry = Awaited<ReturnType<typeof getCachedJournalFeed>>[number];
export type JournalStats = Awaited<ReturnType<typeof getCachedJournalStats>>;
