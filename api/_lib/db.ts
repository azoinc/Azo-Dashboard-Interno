import pg from 'pg';

const { Pool } = pg;

let _pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!_pool) {
    _pool = new Pool({
      host: process.env.SP_HOST,
      database: process.env.SP_DB || 'postgres',
      user: process.env.SP_USER,
      password: process.env.SP_PS,
      port: Number(process.env.SP_PORT) || 6543,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
    });
  }
  return _pool;
}

export async function executeQuery(query: string, params: any[] = []): Promise<any[]> {
  const result = await getPool().query(query, params);
  return result.rows;
}
