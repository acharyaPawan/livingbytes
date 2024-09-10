const { Client } = require('pg');
require('dotenv').config();

// PostgreSQL connection URL
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.log('No connection string');
  process.exit(1);
}

const config = {
  connectionString
};

// if (process.env.NODE_ENV !== 'development') {
//   console.log('Not in development mode. Exiting.');
//   process.exit(1);
// }

(async () => {
  const client = new Client(config);

  try {
    await client.connect();

    // Fetch all table names in the public schema
    const result = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public';
    `);

    const tables = result.rows.map(row => row.tablename);

    // Truncate all tables with CASCADE
    for (const table of tables) {
      try {
        await client.query(`TRUNCATE TABLE public.${table} CASCADE;`);
        console.log(`Truncated table: ${table}`);
      } catch (truncateError) {
        console.error(`Error truncating table ${table}:`, truncateError.message);
      }
    }

    console.log('All possible tables truncated successfully.');

  } catch (err) {
    console.error('Error fetching tables:', err);
  } finally {
    await client.end();
  }
})();
