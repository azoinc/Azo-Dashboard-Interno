import pg from 'pg';

const { Pool } = pg;

let _pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!_pool) {
    _pool = new Pool({
      host: process.env.SP_HOST,
      database: process.env.SP_DB || 'postgres',
      user: process.env.SP_USER,
      password: process.env.SP_PS,
      port: Number(process.env.SP_PORT) || 6543,
      ssl: { rejectUnauthorized: false },
      max: 3,
      connectionTimeoutMillis: 5000,
    });
  }
  return _pool;
}

export default async function handler(req: any, res: any) {
  const cfg = {
    SP_HOST: process.env.SP_HOST || '(missing)',
    SP_USER: process.env.SP_USER ? '(set)' : '(missing)',
    SP_PS: process.env.SP_PS ? '(set)' : '(missing)',
    SP_PORT: process.env.SP_PORT || '(missing)',
    SP_DB: process.env.SP_DB || '(missing)',
  };
  try {
    const result = await getPool().query('SELECT NOW() AS db_time');
    res.status(200).json({ status: 'ok', db_time: result.rows[0].db_time, cfg });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message, cfg });
  }
}
