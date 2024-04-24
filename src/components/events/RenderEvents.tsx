"use client";
import { resType } from "@/app/(site)/(routes)/events/page";
import { Label } from "../ui/label";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { client } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { DeleteAlertDialog } from "../shared/DeleteAlertDialog";

const RenderEventsItem = ({
  event,
}: {
  event: resType extends (infer U)[] ? U : never;
}) => {
  const [isRange, setIsRange] = useState(false);
  const router = useRouter();

  const handleEventDelete = async () => {
    try {
      const { data, error } = await client.event.deleteEvent.mutate({
        eventId: event.id,
      });
      if (data) {
        router.refresh();
      }
      if (error) {
        throw new Error(`Server_Error_Delete:${error}`);
      }
    } catch (e: any) {
      throw new Error("Client_Error_Delete:", e);
    }
  };

  useEffect(() => {
    setIsRange(!!event.rangeEvent); // Set isRange based on the presence of rangeEvent
  }, [event.rangeEvent]);

  return (
    <div>
      <span className="font-serif text-2xl">{event.title}</span>{" "}
      <span className="font-serif text-xl font-extralight text-green-800">
        {event.description}
      </span>
      {isRange
        ? event.rangeEvent && (
            <>
              <Label className="font-poppins font-semibold text-red-800">
                {"From: "}{" "}
                {new Date(event.rangeEvent.startDate).toLocaleDateString()} -
                {" To: "}
                {new Date(event.rangeEvent.endDate).toLocaleDateString()}
              </Label>
              <Badge>Range</Badge>{" "}
            </>
          )
        : event.singleDayEvent && (
            <>
              <Label className="font-poppins font-semibold text-red-800">
                {"At: "}{" "}
                {new Date(event.singleDayEvent.eventDate).toLocaleString()}{" "}
              </Label>
              <Badge>SingleDayEvent</Badge>{" "}
            </>
          )}
      <DeleteAlertDialog type="event" handleDelete={handleEventDelete} />
    </div>
  );
};

const RenderEvents = ({ events }: { events: resType }) => {
  return (
    <>
      <div className="flex flex-col gap-2">
        {events.map((x) => {
          return <RenderEventsItem key={x.id} event={x} />;
        })}
      </div>
    </>
  );
};

export { RenderEvents };
