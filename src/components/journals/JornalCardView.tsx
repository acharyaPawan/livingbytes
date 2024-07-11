import { type JournalType } from "@/app/(site)/(routes)/journals/page";
import ButtonWithRoute from "./ButtonWithRoute";

const JournalCardView = ({ journal }: { journal: JournalType }) => {
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
