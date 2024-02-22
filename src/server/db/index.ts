import { env } from '@/env.mjs';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/server/db/schema'

const sql = neon(env.DATABASE_URL!);

const db = drizzle(sql, {logger:true, schema:schema});

export default db;