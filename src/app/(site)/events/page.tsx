import { AddNewEventDialog } from "@/components/events/AddEvent";
import {EventVisualizer} from "@/components/tasks/EventVisualizer";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

const EventPage = () => {
  return (
    <>
      {/* <div className="grid place-items-center">
      <EventVisualizer />
      </div> */}
      <h1>Events are:</h1>

      <AddNewEventDialog type="event"/>
    </>
  );
};

export default EventPage;
