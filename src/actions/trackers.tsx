"use server"

import { formdataCreateNewTracker } from "@/components/trackers/tracker-ui-component"
import { authOptions, getServerAuthSession } from "@/server/auth"
import db from "@/server/db"
import { trackers } from "@/server/db/schema"
import { TrackerFrequency } from "@/types/types"
import { revalidatePath, revalidateTag } from "next/cache"


export async function createNewTracker(values: formdataCreateNewTracker) {
  try {
    const session = await getServerAuthSession()
    if (!session) {
      return {
        error: "Not authenticated."
      }
    }
    const res = await db.insert(trackers).values({
      // frequency: "Daily" optional,
      // status: "In Progress" default notnull,
      ...values,
      userId: session.user.id,
    }).returning()
    console.log("insert result is ", res)
    await revalidateTag("cached-tracker-data")

    return {
      success: "yep"
    }

  } catch (e) {
    return {
      error: "Server Error"
    }
  }
}