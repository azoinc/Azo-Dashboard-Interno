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
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });
  }
  return _pool;
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { table, select, filters, inFilters, limit, order } = req.body;

    let query = `SELECT ${select || '*'} FROM "${table}" WHERE 1=1`;
    const values: any[] = [];
    let paramIndex = 1;

    if (filters) {
      for (const filter of filters) {
        const { column, operator, value } = filter;
        if (operator === 'eq') {
          query += ` AND "${column}" = $${paramIndex++}`;
          values.push(value);
        } else if (operator === 'gte') {
          query += ` AND "${column}" >= $${paramIndex++}`;
          values.push(value);
        } else if (operator === 'lte') {
          query += ` AND "${column}" <= $${paramIndex++}`;
          values.push(value);
        } else if (operator === 'ilike') {
          query += ` AND "${column}" ILIKE $${paramIndex++}`;
          values.push(value);
        } else if (operator === 'or') {
          // format: "column.ilike.%val%,column2.eq.val2"
          const parts = String(value).split(',');
          const orClauses: string[] = [];
          for (const part of parts) {
            const segments = part.trim().split('.');
            if (segments.length < 3) continue;
            const subCol = segments[0];
            const subOp = segments[1];
            const subVal = segments.slice(2).join('.').replace(/^\/|\/$/g, '');
            if (subOp === 'ilike') {
              orClauses.push(`"${subCol}" ILIKE $${paramIndex++}`);
              values.push(subVal);
            } else if (subOp === 'eq') {
              orClauses.push(`"${subCol}" = $${paramIndex++}`);
              values.push(subVal);
            }
          }
          if (orClauses.length > 0) query += ` AND (${orClauses.join(' OR ')})`;
        }
      }
    }

    if (inFilters) {
      for (const filter of inFilters) {
        const { column, values: inValues } = filter;
        if (inValues && inValues.length > 0) {
          const placeholders = inValues.map(() => `$${paramIndex++}`).join(', ');
          query += ` AND "${column}" IN (${placeholders})`;
          values.push(...inValues);
        } else {
          query += ` AND 1=0`;
        }
      }
    }

    if (order) {
      const { column, ascending } = order;
      query += ` ORDER BY "${column}" ${ascending ? 'ASC' : 'DESC'}`;
    }

    query += limit ? ` LIMIT $${paramIndex++}` : ` LIMIT 50000`;
    if (limit) values.push(limit);

    const result = await getPool().query(query, values);
    res.status(200).json({ data: result.rows, error: null });
  } catch (error: any) {
    console.error('Database query error:', error);
    res.status(500).json({ data: null, error: { message: error.message } });
  }
}
