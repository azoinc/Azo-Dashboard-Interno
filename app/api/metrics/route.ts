import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { querySupabase } from '@/lib/supabase-server';
import { z } from 'zod';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import type { Lead, LeadMilestone } from '@/lib/types';
import { normalizeStatus, getHeatScore } from '@/lib/status-config';

const metricsQuerySchema = z.object({
  empreendimento: z.string().optional().default('all'),
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  // Mês de competência para a lógica 3: status do lead no mês Y (formato YYYY-MM)
  mes_competencia: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  page: z.string().transform((val) => parseInt(val || '1')).pipe(z.number().int().positive()).optional().default(1),
  limit: z.string().transform((val) => parseInt(val || '100')).pipe(z.number().int().positive().max(500)).optional().default(100),
});

interface Metrics {
  leads: number;
  descartes: number;
  em_atendimento: number;
  agendamento: number;
  visita: number;
  venda: number;
}

interface ProcessedMetrics {
  byEmp: Record<string, Metrics>;
  byMonth: Record<string, Metrics>;
  total: Metrics;
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimitResult = rateLimit(identifier, 100, 60000); // 100 requests per minute
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        }
      }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validatedParams = metricsQuerySchema.safeParse(queryParams);
    
    if (!validatedParams.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validatedParams.error.issues },
        { status: 400 }
      );
    }

    const { empreendimento, data_inicio, data_fim, mes_competencia, page, limit } = validatedParams.data;

    // ── Firebase Firestore leads ──────────────────────────────────────────────
    let firebaseLeads: Lead[] = [];
    let firebaseTotal = 0;
    try {
      const adminDb = getAdminDb();
      let baseQuery: FirebaseFirestore.Query = adminDb.collection('leads');
      if (empreendimento !== 'all') {
        baseQuery = baseQuery.where('empreendimento', '==', empreendimento);
      }
      if (data_inicio && data_fim) {
        baseQuery = baseQuery
          .where('data_criacao_cv', '>=', data_inicio)
          .where('data_criacao_cv', '<=', data_fim);
      }
      const [totalSnap, snapshot] = await Promise.all([
        baseQuery.count().get(),
        baseQuery.orderBy('data_criacao_cv', 'desc').limit(limit).offset((page - 1) * limit).get(),
      ]);
      firebaseTotal = totalSnap.data().count;
      firebaseLeads = snapshot.docs.map(doc => doc.data() as Lead);
    } catch (e) {
      console.warn('Firebase unavailable, skipping:', e);
    }

    // ── Supabase leads (pg direto) ────────────────────────────────────────────
    let supabaseLeads: Lead[] = [];
    let supabaseTotal = 0;
    try {
      const offset = (page - 1) * limit;
      const sqlParams: unknown[] = [];
      const conditions: string[] = [];

      if (empreendimento !== 'all') {
        sqlParams.push(empreendimento);
        conditions.push(`empreendimento = $${sqlParams.length}`);
      }
      if (data_inicio) {
        sqlParams.push(data_inicio);
        conditions.push(`data_criacao_cv >= $${sqlParams.length}`);
      }
      if (data_fim) {
        sqlParams.push(data_fim);
        conditions.push(`data_criacao_cv <= $${sqlParams.length}`);
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

      sqlParams.push(limit);
      const limitIdx = sqlParams.length;
      sqlParams.push(offset);
      const offsetIdx = sqlParams.length;

      const [countRes, dataRes] = await Promise.all([
        querySupabase(`SELECT COUNT(*) FROM leads ${where}`, sqlParams.slice(0, -2)),
        querySupabase(
          `SELECT id_cv, nome, status_atual, data_criacao_cv, corretor, empreendimento, origem, midia
           FROM leads ${where}
           ORDER BY data_criacao_cv DESC
           LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
          sqlParams
        ),
      ]);

      supabaseLeads = dataRes.rows as Lead[];
      supabaseTotal = parseInt(countRes.rows[0].count);
    } catch (e) {
      console.warn('Supabase unavailable, skipping:', e);
    }

    // ── Merge: deduplica por id_cv se existir nos dois ────────────────────────
    const seenIds = new Set<string>();
    const allLeads: Lead[] = [];
    for (const lead of [...supabaseLeads, ...firebaseLeads]) {
      const key = lead.id_cv || `${lead.empreendimento}|${lead.data_criacao_cv}|${lead.status_atual}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        allLeads.push(lead);
      }
    }

    // ── Supabase leads_milestones (pg direto, histórico completo) ──────────────
    // Busca TODOS os milestones de leads criados no período X, sem restrição de
    // competencia_data — assim capturamos o pico histórico real de cada lead,
    // mesmo que ele tenha avançado no funil em meses além do período filtrado.
    let milestones: LeadMilestone[] = [];
    try {
      const mParams: unknown[] = [];
      const mConds: string[] = [];

      if (empreendimento !== 'all') {
        mParams.push(empreendimento);
        mConds.push(`empreendimento = $${mParams.length}`);
      }
      // Filtra pelo período de criação do lead (lead_data_cad), NÃO por competencia_data
      // Isso garante que pegamos o histórico completo de cada lead criado no período X
      if (data_inicio) {
        mParams.push(data_inicio);
        mConds.push(`lead_data_cad >= $${mParams.length}`);
      }
      if (data_fim) {
        mParams.push(data_fim);
        mConds.push(`lead_data_cad <= $${mParams.length}`);
      }

      const mWhere = mConds.length ? `WHERE ${mConds.join(' AND ')}` : '';

      const mRes = await querySupabase(
        `SELECT id, lead_id, lead_nome, origem, empreendimento, lead_data_cad,
                safra_data, competencia_data, status_final_mes, corretor, evento_data
         FROM leads_milestones ${mWhere}
         ORDER BY lead_id, competencia_data ASC`,
        mParams
      );
      milestones = mRes.rows as LeadMilestone[];
    } catch (e) {
      console.warn('Supabase milestones unavailable, skipping:', e);
    }

    const total = firebaseTotal + supabaseTotal;
    const metrics = processMetrics(allLeads);

    // ── Lógica 1: status atual dos leads (campo status_atual da tabela leads) ─
    const statusAtualDistribution = computeStatusDistribution(
      allLeads.map(l => l.status_atual)
    );

    // ── Lógica 2: status mais quente já atingido por cada lead ────────────────
    // Usa milestones: para cada lead_id pega o milestone com maior heat score
    const statusMaisQuenteDistribution = computeStatusMaisQuente(milestones);

    // ── Lógica 3: último status do lead no mês Y (competencia) ───────────────
    // Para cada lead criado no período X, qual foi seu último status_final_mes
    // registrado no mês Y de competência (mes_competencia param)
    const statusNoMes = mes_competencia
      ? computeStatusNoMes(milestones, mes_competencia)
      : null;

    const response = NextResponse.json({
      ...metrics,
      // ── Análises de status ────────────────────────────────────────────────
      statusAtual: statusAtualDistribution,
      statusMaisQuente: statusMaisQuenteDistribution,
      statusNoMes,
      mes_competencia: mes_competencia ?? null,
      sources: {
        firebase: { total: firebaseTotal },
        supabase: { total: supabaseTotal, milestones_count: milestones.length },
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

    return response;
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Lógica 1 – Distribuição do status ATUAL dos leads
// ─────────────────────────────────────────────────────────────────────────────
interface StatusDistributionItem {
  status: string;
  canonical: string;
  count: number;
  score: number;
  percentual: number;
}

function computeStatusDistribution(statusList: string[]): StatusDistributionItem[] {
  const counts: Record<string, number> = {};
  for (const raw of statusList) {
    const canonical = normalizeStatus(raw);
    counts[canonical] = (counts[canonical] ?? 0) + 1;
  }
  const total = statusList.length || 1;
  return Object.entries(counts)
    .map(([canonical, count]) => ({
      status: canonical,
      canonical,
      count,
      score: getHeatScore(canonical),
      percentual: Math.round((count / total) * 1000) / 10,
    }))
    .sort((a, b) => b.score - a.score);
}

// ─────────────────────────────────────────────────────────────────────────────
// Lógica 2 – Status MAIS QUENTE já atingido por cada lead
//
// A tabela leads_milestones registra um snapshot por mês de competência:
// cada linha = estado do lead no fechamento daquele mês.
// Para saber o pico histórico real do lead, varremos TODOS os seus milestones
// (todos os meses disponíveis) e escolhemos o que tem maior heat score.
// A query SQL traz todos os meses sem restringir competencia_data, garantindo
// que avançamentos posteriores ao período de cadastro sejam considerados.
// ─────────────────────────────────────────────────────────────────────────────
function computeStatusMaisQuente(milestones: LeadMilestone[]): StatusDistributionItem[] {
  // Agrupa todos os milestones por lead_id (todos os meses)
  const byLead: Record<string, LeadMilestone[]> = {};
  for (const m of milestones) {
    if (!byLead[m.lead_id]) byLead[m.lead_id] = [];
    byLead[m.lead_id].push(m);
  }

  // Para cada lead, percorre todos os seus meses e seleciona o maior score
  const hotStatuses: string[] = [];
  for (const leadMilestones of Object.values(byLead)) {
    const hottest = leadMilestones.reduce((best, m) => {
      const scoreM = getHeatScore(m.status_final_mes);
      const scoreBest = getHeatScore(best.status_final_mes);
      return scoreM > scoreBest ? m : best;
    });
    hotStatuses.push(hottest.status_final_mes);
  }

  return computeStatusDistribution(hotStatuses);
}

// ─────────────────────────────────────────────────────────────────────────────
// Lógica 3 – Último status do lead NO MÊS Y de competência
// Para cada lead criado no período X, pega o milestone mais recente
// cujo competencia_data começa com o mês Y (YYYY-MM)
// ─────────────────────────────────────────────────────────────────────────────
function computeStatusNoMes(
  milestones: LeadMilestone[],
  mesCompetencia: string // formato YYYY-MM
): StatusDistributionItem[] {
  // Filtra apenas milestones do mês de competência
  const daquelesMes = milestones.filter(m =>
    m.competencia_data?.startsWith(mesCompetencia)
  );

  // Para cada lead_id, pega o milestone mais recente do mês
  const byLead: Record<string, LeadMilestone> = {};
  for (const m of daquelesMes) {
    const existing = byLead[m.lead_id];
    if (
      !existing ||
      (m.evento_data ?? '') > (existing.evento_data ?? '')
    ) {
      byLead[m.lead_id] = m;
    }
  }

  const statuses = Object.values(byLead).map(m => m.status_final_mes);
  return computeStatusDistribution(statuses);
}

// ─────────────────────────────────────────────────────────────────────────────
function processMetrics(leads: Lead[]): ProcessedMetrics {
  const byEmp: Record<string, Metrics> = {};
  const byMonth: Record<string, Metrics> = {};
  const total: Metrics = {
    leads: 0,
    descartes: 0,
    em_atendimento: 0,
    agendamento: 0,
    visita: 0,
    venda: 0,
  };

  leads.forEach((lead) => {
    const emp = lead.empreendimento || 'Unknown';
    const mes = new Date(lead.data_criacao_cv).toISOString().slice(0, 7);

    if (!byEmp[emp]) {
      byEmp[emp] = { leads: 0, descartes: 0, em_atendimento: 0, agendamento: 0, visita: 0, venda: 0 };
    }
    if (!byMonth[mes]) {
      byMonth[mes] = { leads: 0, descartes: 0, em_atendimento: 0, agendamento: 0, visita: 0, venda: 0 };
    }

    byEmp[emp].leads++;
    byMonth[mes].leads++;
    total.leads++;

    const score = getHeatScore(lead.status_atual);

    if (score < 0) {
      byEmp[emp].descartes++; byMonth[mes].descartes++; total.descartes++;
    } else if (score < 4) {
      byEmp[emp].em_atendimento++; byMonth[mes].em_atendimento++; total.em_atendimento++;
    } else if (score === 4) {
      byEmp[emp].agendamento++; byMonth[mes].agendamento++; total.agendamento++;
    } else if (score === 5) {
      byEmp[emp].visita++; byMonth[mes].visita++; total.visita++;
    } else if (score >= 6) {
      byEmp[emp].venda++; byMonth[mes].venda++; total.venda++;
    }
  });

  return {
    byEmp,
    byMonth,
    total,
  };
}
