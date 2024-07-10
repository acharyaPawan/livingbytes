"use server";

import { authOptions } from "@/server/auth";
import db from "@/server/db";
import { journals } from "@/server/db/schema";
import { and, eq, lt, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
// import { journals } from "@/server/db/schema"

export const getInitialJournals = async () => {
  try {
    const returnedJournals = await db.query.journals.findMany({
      orderBy: (journals, { desc }) => desc(journals.date),
      limit: 3,
    });
    console.log("journals are ", returnedJournals[0]);
    return returnedJournals;
  } catch (e: unknown) {
    console.error(e);
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw null;
  }
};

export const fetchMoreJournals = async (cursorDate: Date) => {
  try {
    const fetchedJournals = await db.query.journals.findMany({
      where: (journals, { lt }) => lt(journals.date, cursorDate),
      orderBy: (journals, { desc }) => desc(journals.date),
      limit: 10,
    });
    const session = await getServerSession(authOptions);
    if (!session?.user.id) {
      throw new Error("Unauthorized");
    }

    await db
      .select()
      .from(journals)
      .where(
        and(
          lt(sql`DATE(date)`, cursorDate),
          eq(journals.id, session.user.id),
        ),
      );
    console.log("fetched journals are more ", fetchedJournals);
    return fetchedJournals;
  } catch (e: unknown) {
    console.log(e);
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`An error occurred: ${e}`);
  }
};
