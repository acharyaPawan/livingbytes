import { EventBoard } from "@/components/events/EventBoard";
import { getEventBoardData } from "@/data/event/event";

const EventsPage = async () => {
  const { page, stats } = await getEventBoardData();
  return <EventBoard initialPage={page} stats={stats} />;
};

export default EventsPage;
