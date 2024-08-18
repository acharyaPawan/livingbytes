"use server";

import { authOptions } from "@/server/auth";
import db from "@/server/db";
import { journals } from "@/server/db/schema";
import { and, eq, lt, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { z } from "zod";
// import { journals } from "@/server/db/schema"

export const getInitialJournals = async () => {
  try {
    const returnedJournals = await db.query.journals.findMany({
      orderBy: (journals, { desc }) => desc(journals.date),
      // limit: 3,
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
        and(lt(sql`DATE(date)`, cursorDate), eq(journals.id, session.user.id)),
      );
    console.log("fetched journals are more ", fetchedJournals);
    return fetchedJournals;
  } catch (e: unknown) {
    console.log(e);
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`An error occurred: ${e}`);
  }
};

export const updateJournalTitle = async ({
  journalId,
  title,
}: {
  journalId: string;
  title: string;
}) => {
  type returnObjectType = {
    success?: string;
    error?: string;
  };
  // Input Validation
  const zodSchemaForInputs = z.object({
    journalId: z.string().uuid(),
    title: z.string().min(3, {message: "Minimum 3 letter long."}),
  });

  let inputs: { journalId: string; title: string };

  try {
    inputs = zodSchemaForInputs.parse({ journalId, title });
  } catch (e) {
    if (e instanceof z.ZodError) {
      console.log("ERROR::::Zod validation error ", e)
      return {
        error: `Validation Error message:${e.message}`,
      };
    }
    return {
      error: "Error occurred",
    };
  }

  // Check user authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      error: "Not authenticated",
    };
  }

  // Extract journal from database
  let result:
    | {
        date: Date;
        id: string;
        description: string | null;
        userId: string;
        fileUrl: string | null;
        title: string | null;
        content: string | null;
      }
    | undefined;

  try {
    
    result = await db.query.journals.findFirst({
      where: (journals, { eq }) => eq(journals.id, inputs.journalId),
    });
  } catch (e) {
    console.log("ERROR::::Extracting Journals From db.");
    return {
      error: "No such journal in our dataset.",
    };
  }
  if (!result || result.userId !== session.user.id) {
    console.log("input journal id, result journal id:::", inputs.journalId, result?.id)

    if (!result) {
      return {
        error: "No Journal by this id."
      }
    }

    console.log("user session id, result user id ", session.user.id, result.userId)
    return {
      error: "Your donot have priveliage.",
    };
  }

  try {
    const result1: {updatedTitle: string | null}[] = await db
    .update(journals)
    .set({
      title: inputs.title,
    })
    .where(eq(journals.id, inputs.journalId)).returning({
      updatedTitle: journals.title
    });

     return {
      success: result1[0]?.updatedTitle ?? "*Empty title"
     }
  } catch (e) {
    console.log("ERROR::::Updating db title.")
    return {
      error: "Error while updating."
    }
  }

};
