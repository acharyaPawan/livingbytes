import JournalViewById from "@/components/journals/JournalView";
import { getServerAuthSession } from "@/server/auth";
import db from "@/server/db";
import { journals } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";

export const JournalPageById = async ({
  params,
}: {
  params: { journalId: string };
}) => {
  const session = await getServerAuthSession();
  if (!session) {
    return <div>Not authorized</div>;
  }
  let journalById
  try {
    journalById = await db.query.journals.findFirst({
    where: and(
      eq(journals.id, params.journalId), eq(journals.userId, session.user.id),
    ),
    columns: {
      id: true,
      title: true,
      description: true,
      content: true,
      date: true
    }
  });
} catch {
  return null
}
  if (!journalById) {
    return (
      <div>
        No journal by Id.
      </div>
    )
  }

  // console.log("1", "response is: ", journalById)

  return (
    <JournalViewById journal={journalById} />
  );
};

export default JournalPageById;
