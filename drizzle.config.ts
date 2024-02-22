import { type Config } from "drizzle-kit";

import { env } from "./src/env.mjs";

export default {
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  verbose: true,
  dbCredentials: {
    connectionString: "postgresql://pawanacharya101:y3xbVTF8nGQY@ep-mute-hall-07760410-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
  },
} satisfies Config;
