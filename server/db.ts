import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@shared/schema";

// Build connection string from individual environment variables or use DATABASE_URL
let connectionString: string;

if (process.env.DATABASE_URL) {
  connectionString = process.env.DATABASE_URL;
} else if (process.env.POSTGRES_HOSTNAME && process.env.POSTGRES_PASSWORD && process.env.POSTGRES_DB) {
  const username = process.env.POSTGRES_USER || 'postgres';
  const password = process.env.POSTGRES_PASSWORD;
  let hostname = process.env.POSTGRES_HOSTNAME;
  const port = process.env.POSTGRES_PORT || '5432';
  const database = process.env.POSTGRES_DB;
  
  console.log('Building connection string with hostname:', hostname);
  
  // Remove protocol prefix if present (https://, http://)
  hostname = hostname.replace(/^https?:\/\//, '');
  
  // Remove any trailing path/slashes
  hostname = hostname.replace(/\/.*$/, '');
  
  console.log('Cleaned hostname:', hostname);
  
  connectionString = `postgresql://${username}:${password}@${hostname}:${port}/${database}`;
  console.log('Connection string (password hidden):', connectionString.replace(/:([^@]+)@/, ':****@'));
} else {
  throw new Error("Database connection details are required (either DATABASE_URL or POSTGRES_* variables)");
}

const client = postgres(connectionString, {
  ssl: 'prefer',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
