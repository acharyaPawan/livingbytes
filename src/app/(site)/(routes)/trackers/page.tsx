import { TrackerBoard } from "@/components/trackers/TrackerBoard";
import { getTrackerTaskOptions, getTrackers } from "@/data/tracker/tracker";

const TrackerPage = async () => {
  const [trackers, taskOptions] = await Promise.all([
    getTrackers(),
    getTrackerTaskOptions(),
  ]);

  return (
    <div className="h-full w-full overflow-y-auto px-2 pb-10 lg:px-4">
      <TrackerBoard trackers={trackers} taskOptions={taskOptions} />
    </div>
  );
};

export default TrackerPage;
