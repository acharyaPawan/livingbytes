import type { JournalFeedEntry } from "@/data/journal/journal";
import ButtonWithRoute from "./ButtonWithRoute";

const JournalCardView = ({ journal }: { journal: JournalFeedEntry }) => {
  // const link = `/journal/${Journal}`
  return (
    <>
      <ButtonWithRoute href={`/journals/${journal.id}`}>
        Got to Journal of date: {journal.date.toLocaleDateString()}
      </ButtonWithRoute>
    </>
  );
};
export default JournalCardView;
