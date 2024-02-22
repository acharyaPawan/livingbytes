import { env } from '@/env.mjs';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool);
