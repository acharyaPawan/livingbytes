import { AddNewEventDialog } from "@/components/events/AddEvent";
import { RenderEvents } from "@/components/events/RenderEvents";

import { getServerAuthSession } from "@/server/auth";
import db from "@/server/db";
import { events } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const res = await db.query.events.findMany({
  where: eq(events.userId, "Nepal" as string),
  with: {
    singleDayEvent: true,
    rangeEvent: true,
  },
});
export type resType = typeof res;

const EventPage = async () => {
  const session = await getServerAuthSession();
  if (!session) {
    return <div>Youare not autheticated</div>;
  }
  console.log("authenticated");

  const startTime = new Date();

  const res: resType = await db.query.events.findMany({
    where: eq(events.userId, session?.user.id as string),
    with: {
      singleDayEvent: true,
      rangeEvent: true,
    },
  });

  const parseISODate = (isoDateString: Date) => {
    return new Date(isoDateString);
  };

  const timeUntilNextEvent = (date: Date) => {
    const today = new Date();
    date.setFullYear(today.getFullYear());
    return date.getTime() - today.getTime();
  };

  const sortedPeople = res.sort((a, b) => {
    const aDate = !!a.rangeEvent
      ? a.rangeEvent.startDate
      : a.singleDayEvent?.eventDate;
    const bDate = !!b.rangeEvent
      ? b.rangeEvent.startDate
      : b.singleDayEvent?.eventDate;

    const firstTime = timeUntilNextEvent(parseISODate(aDate as Date));
    const secondTime = timeUntilNextEvent(parseISODate(bDate as Date));

    return firstTime - secondTime;
  });

  const endTime = new Date();
  console.log(`elapsed time: ${endTime.getTime() - startTime.getTime()} ms.`);

  return (
    <>
      <header className="m-4">
        <h1 className="font-serif text-lg font-bold">Events are:</h1>
      </header>
      <aside className="ml-8 mt-2">
        <RenderEvents events={res} />
        <AddNewEventDialog type="event" />
      </aside>
    </>
  );
};

export default EventPage;
