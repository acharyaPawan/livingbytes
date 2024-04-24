import { getInitialJournals } from "@/actions/journals";
import ButtonWithRoute from "@/components/journals/ButtonWithRoute";
import JournalListInfinite from "@/components/journals/JournalListInfinite";
import { type journals } from "@/server/db/schema";
import { type InferSelectModel } from "drizzle-orm";

export type JournalType = InferSelectModel<typeof journals>;

const JournalsDashboard = async () => {
  const initialJournals = await getInitialJournals();
  if (initialJournals?.length == 0 && !initialJournals[initialJournals.length - 1]?.date) {
    return (
      <div>
        Nothing in the database, create journals to view here
        <div>
        <ButtonWithRoute href="/journal/today">Write Todays Journal</ButtonWithRoute>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <ButtonWithRoute href="/journal/today">Write Todays Journal</ButtonWithRoute>
      </div>
      <p>Journals List</p>
      <JournalListInfinite initialPosts={initialJournals} />
    </div>
  );
};

export default JournalsDashboard;
