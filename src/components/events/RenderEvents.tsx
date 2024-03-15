"use client";
import { resType } from "@/app/(site)/events/page";
import { Label } from "../ui/label";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const RenderEventsItem = ({
  event,
}: {
  event: resType extends (infer U)[] ? U : never;
}) => {
  const [isRange, setIsRange] = useState(false);

  useEffect(() => {
    setIsRange(!!event.rangeEvent); // Set isRange based on the presence of rangeEvent
  }, [event.rangeEvent]);

  return (
    <div>
      <span className="font-serif text-2xl">{event.title}</span> <span className="font-serif text-xl font-extralight text-green-800">{event.description}</span>
      {isRange ? (
        event.rangeEvent && (
          <>
          <Label className="font-poppins font-semibold text-red-800">
            {"From: "} {new Date(event.rangeEvent.startDate).toLocaleDateString()} -{" To: "}
            {new Date(event.rangeEvent.endDate).toLocaleDateString()}
          </Label>
          <Badge>Range</Badge> {" "}
          <Button>Delete</Button>
          </>
        )
      ) : (
        event.singleDayEvent && (
          <>
          <Label className="font-poppins font-semibold text-red-800">
            {"At: "} {new Date(event.singleDayEvent.eventDate).toLocaleString()} {" "}
          </Label>
          <Badge>SingleDayEvent</Badge> {" "}
          <Button className="">Delete</Button>
          </>

        )
      )}
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
