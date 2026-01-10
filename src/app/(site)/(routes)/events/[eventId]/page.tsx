import { EventDetail } from "@/components/events/EventDetail";
import { getEventEntry } from "@/data/event/event";

type Props = {
  params: Promise<{
    eventId: string;
  }>;
};

const EventDetailPage = async ({ params }: Props) => {
  const { eventId } = await params;
  const entry = await getEventEntry(eventId);
  return <EventDetail entry={entry} />;
};

export default EventDetailPage;
