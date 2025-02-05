import 'server-only'
import { getServerAuthSession } from '@/server/auth'
import { cache } from 'react';

// A memoized function to get cache in different part.
export const getMemoizedSession = cache(async () => {
  const session = await getServerAuthSession();
  return session
})