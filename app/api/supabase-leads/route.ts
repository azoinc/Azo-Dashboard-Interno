import { NextRequest, NextResponse } from 'next/server';
import { querySupabase } from '@/lib/supabase-server';
import { z } from 'zod';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import type { Lead, LeadMilestoneEvent } from '@/lib/types';

const querySchema = z.object({
  empreendimento: z.string().optional().default('all'),
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z
    .string()
    .transform(v => parseInt(v || '1'))
    .pipe(z.number().int().positive())
    .optional()
    .default(1),
  limit: z
    .string()
    .transform(v => parseInt(v || '100'))
    .pipe(z.number().int().positive().max(500))
    .optional()
    .default(100),
  include_milestones: z
    .string()
    .transform(v => v === 'true')
    .optional()
    .default(false),
});

export async function GET(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const rateLimitResult = rateLimit(identifier, 100, 60000);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        },
      }
    );
  }

  try {
    const parsed = querySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { empreendimento, data_inicio, data_fim, page, limit, include_milestones } =
      parsed.data;

    const offset = (page - 1) * limit;

    // ── Monta cláusulas WHERE reutilizáveis ──────────────────────────────────
    const lParams: unknown[] = [];
    const lConds: string[] = [];
    if (empreendimento !== 'all') {
      lParams.push(empreendimento);
      lConds.push(`empreendimento = $${lParams.length}`);
    }
    if (data_inicio) {
      lParams.push(data_inicio);
      lConds.push(`data_criacao_cv >= $${lParams.length}`);
    }
    if (data_fim) {
      lParams.push(data_fim);
      lConds.push(`data_criacao_cv <= $${lParams.length}`);
    }
    const lWhere = lConds.length ? `WHERE ${lConds.join(' AND ')}` : '';

    // params paginados ($N começa em 1)
    const lPageParams = [...lParams, limit, offset];
    const limitIdx = lPageParams.length - 1;  // índice do limit
    const offsetIdx = lPageParams.length;       // índice do offset

    // ── Query leads em paralelo com count ────────────────────────────────────
    const [countRes, leadsRes] = await Promise.all([
      querySupabase(`SELECT COUNT(*) FROM leads ${lWhere}`, lParams),
      querySupabase(
        `SELECT id_cv, nome, status_atual, data_criacao_cv, hora_criacao_cv,
                corretor, empreendimento, origem, midia
         FROM leads ${lWhere}
         ORDER BY data_criacao_cv DESC
         LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
        lPageParams
      ),
    ]);

    const totalLeads = parseInt(countRes.rows[0].count);
    const leads = leadsRes.rows as Lead[];

    // ── Query lead_milestones (opcional) ────────────────────────────────────
    let lead_milestones: LeadMilestoneEvent[] | undefined;
    let totalMilestones: number | undefined;

    if (include_milestones) {
      const mParams: unknown[] = [];
      const mConds: string[] = [];
      if (empreendimento !== 'all') {
        mParams.push(empreendimento);
        mConds.push(`empreendimento = $${mParams.length}`);
      }
      if (data_inicio) {
        mParams.push(data_inicio);
        mConds.push(`lead_data_cad >= $${mParams.length}`);
      }
      if (data_fim) {
        mParams.push(data_fim);
        mConds.push(`lead_data_cad <= $${mParams.length}`);
      }
      const mWhere = mConds.length ? `WHERE ${mConds.join(' AND ')}` : '';
      const mPageParams = [...mParams, limit, offset];
      const mLimitIdx = mPageParams.length - 1;  // índice do limit
      const mOffsetIdx = mPageParams.length;       // índice do offset

      const [mCountRes, mRes] = await Promise.all([
        querySupabase(`SELECT COUNT(*) FROM lead_milestones ${mWhere}`, mParams),
        querySupabase(
          `SELECT id, id_historico_cv, lead_id, lead_nome, empreendimento, origem,
                  status, de_nome, para_nome, motivo_cancelamento, data_cancelamento,
                  corretor, lead_data_cad, referencia_data, ativo
           FROM lead_milestones ${mWhere}
           ORDER BY referencia_data DESC
           LIMIT $${mLimitIdx} OFFSET $${mOffsetIdx}`,
          mPageParams
        ),
      ]);

      lead_milestones = mRes.rows as LeadMilestoneEvent[];
      totalMilestones = parseInt(mCountRes.rows[0].count);
    }

    const response = NextResponse.json({
      leads,
      lead_milestones,
      pagination: {
        page,
        limit,
        total_leads: totalLeads,
        total_milestones: totalMilestones,
        totalPages: Math.ceil(totalLeads / limit),
      },
    });

    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

    return response;
  } catch (error) {
    console.error('Error fetching Supabase leads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
