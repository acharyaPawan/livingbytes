import { AddNewTracker, DialogDrawerFrame, DialogDrawerFrameHandle, TrackerForm } from "@/components/trackers/tracker-ui-component"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import db from "@/server/db"
import { subtasks, tasks, trackers } from "@/server/db/schema"
import { unstable_cache } from "next/cache"
import Error from "next/error"
import { useRef } from "react"


//get trackers
// revalidate and fetch


const getCachedTrackers = unstable_cache(async () => {
  console.log("Cached not triggered.")
  return await db.query.trackers.findMany({
  orderBy: (trackers, { desc }) => desc(trackers.createdOn)
})}, [], {
  tags: ["cached-tracker-data"]
})


const getCachedTasksName = unstable_cache(async () => {
  console.log("Cache not triggered")
  return await db.query.tasks.findMany({
    columns: {
      title: true,
    },
  })
})




console.log("Result from db is : ", (await getCachedTrackers()))


const TrackerPage = async () => {
  const trackersFromDb = await getCachedTrackers()
    return (
    <div className="">
      <h1>Trackers</h1>
      <div>
        {!trackersFromDb || trackersFromDb?.length === 0 && (
          <p>No trackers currently in your profile.</p>
        )}
      </div>
      <AddNewTracker className="max-h-2/3 overflow-y-scroll" />
      {trackersFromDb.map((t) => {
        return (
          <div key={t.id} className="flex flex-col">
            <div className="flex flex-row gap-3 justify-between md: max-w-3xl"><h2>{t.title}</h2><Label>{t.status}</Label><span>{t.frequency}</span></div>
          </div>
        )
      })}
    </div>
  )
}

export default TrackerPage