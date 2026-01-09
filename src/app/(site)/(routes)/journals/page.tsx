import { JournalBoard } from "@/components/journals/JournalBoard";
import { getJournalBoardData } from "@/data/journal/journal";

const JournalsDashboard = async () => {
  const { page, stats } = await getJournalBoardData();
  const initialPage = {
    items: page.items,
    nextCursor: page.nextCursor ? page.nextCursor.toISOString() : null,
  };

  return <JournalBoard initialPage={initialPage} stats={stats} />;
};

export default JournalsDashboard;
