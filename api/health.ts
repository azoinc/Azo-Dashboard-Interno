import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.SP_HOST,
  database: process.env.SP_DB || 'postgres',
  user: process.env.SP_USER,
  password: process.env.SP_PS,
  port: Number(process.env.SP_PORT) || 6543,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req: any, res: any) {
  try {
    const result = await pool.query('SELECT NOW() AS db_time');
    res.status(200).json({ status: 'ok', db_time: result.rows[0].db_time });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}
