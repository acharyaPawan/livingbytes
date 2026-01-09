"server-only";

import { redirect } from "next/navigation";

import { getMemoizedSession } from "@/memoize/session";

import {
  TrackerWithTasks,
  getCachedTaskOptionsForTrackers,
  getCachedTrackers,
} from "./tracker-db";

export const getTrackers = async (): Promise<TrackerWithTasks> => {
  const session = await getMemoizedSession();
  if (!session) {
    redirect("/api/auth/signin");
  }

  return getCachedTrackers(session.user.id);
};

export const getTrackerTaskOptions = async () => {
  const session = await getMemoizedSession();
  if (!session) {
    redirect("/api/auth/signin");
  }

  return getCachedTaskOptionsForTrackers(session.user.id);
};

export type TrackerTaskOption = Awaited<
  ReturnType<typeof getCachedTaskOptionsForTrackers>
>[number];
