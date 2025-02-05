import 'server-only'
import db from '@/server/db';
import { unstable_cache } from 'next/cache';
import { getMemoizedSession } from '@/memoize/session';
import { redirect } from 'next/navigation';
import { getCachedCategorizedTask } from './task-db';


export const getCategorizedTask = async () => {
  // Check auth
  const session = await getMemoizedSession();
  if (!session) {
    redirect("/api/auth/signin");
  }

  return getCachedCategorizedTask(session.user.id);
}
  