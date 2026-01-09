"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { and, desc, eq, lt } from "drizzle-orm";

import { getMemoizedSession } from "@/memoize/session";
import db from "@/server/db";
import { journals } from "@/server/db/schema";
import { journalTags } from "@/shared/journal";

const baseJournalSelect = {
  id: journals.id,
  date: journals.date,
  title: journals.title,
  description: journals.description,
  content: journals.content,
  fileUrl: journals.fileUrl,
  userId: journals.userId,
};

const revalidate = (userId: string) => {
  journalTags(userId).forEach((tag) => revalidateTag(tag));
};

export const getInitialJournals = async (limit = 10) => {
  const session = await getMemoizedSession();
  if (!session?.user?.id) return [];

  return db.query.journals.findMany({
    where: (journal, { eq }) => eq(journal.userId, session.user.id),
    orderBy: (journal, { desc }) => desc(journal.date),
    limit,
    columns: baseJournalSelect,
  });
};

export const fetchMoreJournals = async (cursorDate: Date, limit = 10) => {
  const session = await getMemoizedSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return db.query.journals.findMany({
    where: (journal, { and, eq, lt }) =>
      and(eq(journal.userId, session.user.id), lt(journal.date, cursorDate)),
    orderBy: (journal, { desc }) => desc(journal.date),
    limit,
    columns: baseJournalSelect,
  });
};

export const updateJournalTitle = async ({
  journalId,
  title,
}: {
  journalId: string;
  title: string;
}) => {
  const inputs = z
    .object({
      journalId: z.string().uuid(),
      title: z.string().min(3, { message: "Minimum 3 letters long." }),
    })
    .parse({ journalId, title });

  const session = await getMemoizedSession();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const [existing] = await db
    .select()
    .from(journals)
    .where(and(eq(journals.id, inputs.journalId), eq(journals.userId, session.user.id)));

  if (!existing) {
    return { error: "No journal found." };
  }

  const [result] = await db
    .update(journals)
    .set({ title: inputs.title })
    .where(eq(journals.id, inputs.journalId))
    .returning({ updatedTitle: journals.title });

  revalidate(session.user.id);
  return { success: result?.updatedTitle ?? title };
};
