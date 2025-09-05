import { env } from '@/env.mjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/server/db/schema'
import { tasksRelations } from '@/server/db/schema';

const queryClient = postgres(env.DATABASE_URL!);
const db = drizzle(queryClient, {logger: true, schema: schema});

export default db;