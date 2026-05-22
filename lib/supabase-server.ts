// Conexão direta ao PostgreSQL do Supabase via pool pg
// Usado apenas em API Routes (server-side) — nunca importar no client
import { Pool } from 'pg';

let pool: Pool | null = null;

export function getSupabasePool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.SUPABASE_DB_URL;

  if (!connectionString) {
    const host = process.env.SUPABASE_DB_HOST;
    const port = parseInt(process.env.SUPABASE_DB_PORT || '5432');
    const database = process.env.SUPABASE_DB_NAME || 'postgres';
    const user = process.env.SUPABASE_DB_USER || 'postgres';
    const password = process.env.SUPABASE_DB_PASSWORD;

    if (!host || !password) {
      throw new Error(
        'Missing Supabase DB env vars: set SUPABASE_DB_URL or (SUPABASE_DB_HOST + SUPABASE_DB_PASSWORD)'
      );
    }

    pool = new Pool({ host, port, database, user, password, ssl: { rejectUnauthorized: false }, max: 10 });
  } else {
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false }, max: 10 });
  }

  pool.on('error', (err) => {
    console.error('Supabase pool error:', err);
  });

  return pool;
}

export async function querySupabase(text: string, params?: unknown[]) {
  const start = Date.now();
  try {
    const res = await getSupabasePool().query(text, params);
    console.log('Supabase query', { ms: Date.now() - start, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Supabase query error:', error);
    throw error;
  }
}
