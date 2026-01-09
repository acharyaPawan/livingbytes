import { addDays, endOfDay, startOfDay } from "date-fns";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { and, desc, eq, gte, ilike, isNotNull, lt, lte, or, sql } from "drizzle-orm";

import {
  defaultJournalContent,
  journalListInput,
  journalTags,
  journalUpsertSchema,
} from "@/shared/journal";
import { journals } from "@/server/db/schema";

import { createTRPCRouter, protectedProcedure } from "../trpc";

const journalColumns = {
  id: true,
  title: true,
  description: true,
  content: true,
  date: true,
  userId: true,
  fileUrl: true,
};

const journalSelection = {
  id: journals.id,
  title: journals.title,
  description: journals.description,
  content: journals.content,
  date: journals.date,
  userId: journals.userId,
  fileUrl: journals.fileUrl,
};

const revalidateJournals = (userId: string) => {
  journalTags(userId).forEach((tag) => revalidateTag(tag));
};

const buildJournalWhere = ({
  userId,
  cursor,
  from,
  to,
  search,
  hasAttachment,
  hasContent,
}: {
  userId: string;
  cursor?: Date;
  from?: Date;
  to?: Date;
  search?: string;
  hasAttachment?: boolean;
  hasContent?: boolean;
}) => {
  const normalizedSearch = search?.trim();

  return (journal: typeof journals) =>
    and(
      eq(journal.userId, userId),
      cursor ? lt(journal.date, cursor) : undefined,
      from ? gte(journal.date, startOfDay(from)) : undefined,
      to ? lte(journal.date, endOfDay(to)) : undefined,
      hasAttachment ? isNotNull(journal.fileUrl) : undefined,
      hasContent ? sql`length(${journal.content}) > 2` : undefined,
      normalizedSearch
        ? or(
            ilike(journal.title, `%${normalizedSearch}%`),
            ilike(journal.description, `%${normalizedSearch}%`),
            ilike(sql`coalesce(${journal.content}, '')`, `%${normalizedSearch}%`),
          )
        : undefined,
    );
};

export const journalRouter = createTRPCRouter({
  list: protectedProcedure.input(journalListInput).query(async ({ ctx, input }) => {
    const { cursor: cursorIso, limit, filters } = input;
    const cursor = cursorIso ? new Date(cursorIso) : undefined;

    const rows = await ctx.db.query.journals.findMany({
      where: buildJournalWhere({
        userId: ctx.session.user.id,
        cursor,
        from: filters.from,
        to: filters.to,
        search: filters.search,
        hasAttachment: filters.hasAttachment,
        hasContent: filters.hasContent,
      }),
      orderBy: (journal, { desc }) => desc(journal.date),
      columns: journalColumns,
      limit: limit + 1,
    });

    let nextCursor: string | undefined;
    if (rows.length > limit) {
      const next = rows.pop();
      nextCursor = next?.date ? new Date(next.date).toISOString() : undefined;
    }

    return {
      items: rows,
      nextCursor,
    };
  }),

  summary: protectedProcedure.query(async ({ ctx }) => {
    const entries = await ctx.db.query.journals.findMany({
      where: (journal, { eq }) => eq(journal.userId, ctx.session.user.id),
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
      new Set(
        entries.map((entry) => startOfDay(new Date(entry.date)).getTime()),
      ),
    ).sort((a, b) => b - a);

    let streak = 0;
    let cursor = todayStart;
    while (normalizedDates.includes(cursor)) {
      streak += 1;
      cursor = startOfDay(addDays(new Date(cursor), -1)).getTime();
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
  }),

  getById: protectedProcedure
    .input(
      z.object({
        documentId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [document] = await ctx.db
        .select(journalSelection)
        .from(journals)
        .where(eq(journals.id, input.documentId));

      if (!document) {
        throw new Error("Not found");
      }

      if (document.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      return document;
    }),

  create: protectedProcedure
    .input(
      journalUpsertSchema.pick({
        title: true,
        description: true,
        date: true,
        fileUrl: true,
        content: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const targetDate = startOfDay(input.date ?? new Date());
      const endDate = endOfDay(targetDate);

      const [existing] = await ctx.db.query.journals.findMany({
        where: (journal, { and, eq, gte, lte }) =>
          and(
            eq(journal.userId, userId),
            gte(journal.date, targetDate),
            lte(journal.date, endDate),
          ),
        limit: 1,
      });

      if (existing) {
        return existing;
      }

      const payload = {
        userId,
        date: targetDate,
        title: input.title ?? `Journal — ${targetDate.toDateString()}`,
        description: input.description,
        content: input.content ?? defaultJournalContent,
        fileUrl: input.fileUrl,
      };

      const [document] = await ctx.db.insert(journals).values(payload).returning();

      if (!document) {
        throw new Error("Not Created");
      }

      revalidateJournals(userId);
      return document;
    }),

  retrieveTodaysDocument: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const today = startOfDay(new Date());
    const [document] = await ctx.db.query.journals.findMany({
      where: (journal, { and, eq, gte, lte }) =>
        and(eq(journal.userId, userId), gte(journal.date, today), lte(journal.date, endOfDay(today))),
      limit: 1,
    });

    if (document) {
      return document;
    }

    const [created] = await ctx.db
      .insert(journals)
      .values({
        userId,
        date: today,
        title: `Journal — ${today.toDateString()}`,
        content: defaultJournalContent,
      })
      .returning();

    if (!created) {
      throw new Error("Unable to create document");
    }

    revalidateJournals(userId);
    return created;
  }),

  update: protectedProcedure
    .input(
      z
        .object({
          id: z.string().uuid(),
          title: z.string().trim().min(1).max(180).optional(),
          content: z.string().optional(),
          description: z.string().max(320).optional(),
          fileUrl: z
            .string()
            .url({ message: "Enter a valid URL" })
            .max(500)
            .optional()
            .or(z.literal("")),
        })
        .refine(
          (data) =>
            data.title !== undefined ||
            data.content !== undefined ||
            data.description !== undefined ||
            data.fileUrl !== undefined,
          { message: "No updates provided" },
        ),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...rest } = input;

      const [existingDocument] = await ctx.db
        .select()
        .from(journals)
        .where(eq(journals.id, id));

      if (!existingDocument) {
        throw new Error("Not found");
      }

      if (existingDocument.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      const updates = {
        ...(rest.title !== undefined ? { title: rest.title } : {}),
        ...(rest.content !== undefined ? { content: rest.content } : {}),
        ...(rest.description !== undefined ? { description: rest.description } : {}),
        ...(rest.fileUrl !== undefined ? { fileUrl: rest.fileUrl || null } : {}),
      };

      const [document] = await ctx.db
        .update(journals)
        .set(updates)
        .where(eq(journals.id, existingDocument.id))
        .returning();

      revalidateJournals(ctx.session.user.id);
      return document;
    }),

  remove: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const [existingDocument] = await ctx.db
        .select()
        .from(journals)
        .where(eq(journals.id, input.id));

      if (!existingDocument) {
        throw new Error("Not found");
      }

      if (existingDocument.userId !== userId) {
        throw new Error("Unauthorized");
      }

      const [deletedDocument] = await ctx.db
        .delete(journals)
        .where(eq(journals.id, input.id))
        .returning();

      revalidateJournals(userId);
      return deletedDocument;
    }),
});
