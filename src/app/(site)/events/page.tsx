import { AddNewEventDialog } from "@/components/events/AddEvent";

import { getServerAuthSession } from "@/server/auth";
import db from "@/server/db";
import { events } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const EventPage = async () => {
  const session = await getServerAuthSession();
  if (!session) {
    return <div>Youare not autheticated</div>;
  }
  console.log("authenticated");

  const startTime = new Date();

  const res = await db.query.events.findMany({
    where: eq(events.userId, session?.user.id as string),
    with: {
      singleDayEvent: true,
      rangeEvent: true,
    },
  });
  const endTime = new Date();
  console.log(`elapsed time: ${endTime.getTime() - startTime.getTime()} ms.`);

  return (
    <>
      <h1>Events are:</h1>
      {res.map((x) => {
        return (
          <div key={x.id}>
            <div>
              {x.title} {x.description} {new Date(x.singleDayEvent?.eventDate as Date).toLocaleString()}{" "}
              {x.rangeEvent?.startDate.toDateString()} {x.id}
            </div>
          </div>
        );
      })}

      <AddNewEventDialog type="event" />
    </>
  );
};

export default EventPage;
