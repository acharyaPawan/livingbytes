import { notFound } from "next/navigation";

import { JournalEntryEditor } from "@/components/journals/JournalEntryEditor";
import { getJournalEntry } from "@/data/journal/journal";

type Params = {
  journalId: string;
};

const JournalDetailPage = async ({ params }: { params: Params }) => {
  const entry = await getJournalEntry(params.journalId).catch(() => null);

  if (!entry) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <JournalEntryEditor entry={entry} />
    </div>
  );
};

export default JournalDetailPage;
