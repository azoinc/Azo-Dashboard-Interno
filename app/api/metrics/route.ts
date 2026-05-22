import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { querySupabase } from '@/lib/supabase-server';
import { z } from 'zod';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import type { Lead, LeadMilestoneEvent, LeadSnapshotMensal } from '@/lib/types';
import { normalizeStatus, getHeatScore } from '@/lib/status-config';

// Filtro de modo: separa leads orgânicos dos de ações de marketing
const ACOES_MARKETING_PATTERN = 'Ação de Marketing';

const metricsQuerySchema = z.object({
  empreendimento: z.string().optional().default('all'),
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  // Mês de competência para a lógica 3: status do lead no mês Y (formato YYYY-MM)
  mes_competencia: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  // organico = exclui status com "Ação de Marketing"
  // acoes_marketing = só status com "Ação de Marketing"
  // all (padrão) = sem filtro
  modo: z.enum(['organico', 'acoes_marketing', 'all']).optional().default('all'),
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

    const { empreendimento, data_inicio, data_fim, mes_competencia, modo, page, limit } = validatedParams.data;

    // Cláusula SQL de filtro de modo — aplicada em leads.status_atual e lead_milestones.status
    const modoLeadsCond =
      modo === 'organico'        ? `AND status_atual NOT ILIKE '%${ACOES_MARKETING_PATTERN}%'` :
      modo === 'acoes_marketing' ? `AND status_atual ILIKE '%${ACOES_MARKETING_PATTERN}%'`    : '';
    const modoEventsCond =
      modo === 'organico'        ? `AND status NOT ILIKE '%${ACOES_MARKETING_PATTERN}%'` :
      modo === 'acoes_marketing' ? `AND status ILIKE '%${ACOES_MARKETING_PATTERN}%'`    : '';
    const modoSnapshotCond =
      modo === 'organico'        ? `AND status_final_mes NOT ILIKE '%${ACOES_MARKETING_PATTERN}%'` :
      modo === 'acoes_marketing' ? `AND status_final_mes ILIKE '%${ACOES_MARKETING_PATTERN}%'`    : '';

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
        querySupabase(`SELECT COUNT(*) FROM leads ${where} ${modoLeadsCond}`, sqlParams.slice(0, -2)),
        querySupabase(
          `SELECT id_cv, nome, status_atual, data_criacao_cv, corretor, empreendimento, origem, midia
           FROM leads ${where} ${modoLeadsCond}
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
      const key = lead.id_cv
        ? String(lead.id_cv)
        : `${lead.empreendimento}|${lead.data_criacao_cv}|${lead.status_atual}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        allLeads.push(lead);
      }
    }

    // ── Supabase: eventos individuais de status (lead_milestones) ──────────────
    // Cada linha = uma transição de status (de_nome → para_nome).
    // Usado para statusAtual e statusMaisQuente.
    // Filtra por lead_data_cad (criação do lead no período X) SEM restringir
    // referencia_data, para capturar todo o histórico do lead.
    let milestoneEvents: LeadMilestoneEvent[] = [];
    try {
      const eParams: unknown[] = [];
      const eConds: string[] = ['ativo = $1'];
      eParams.push('S');

      if (empreendimento !== 'all') {
        eParams.push(empreendimento);
        eConds.push(`empreendimento = $${eParams.length}`);
      }
      if (data_inicio) {
        eParams.push(data_inicio);
        eConds.push(`lead_data_cad >= $${eParams.length}`);
      }
      if (data_fim) {
        eParams.push(data_fim);
        eConds.push(`lead_data_cad <= $${eParams.length}`);
      }

      const eWhere = `WHERE ${eConds.join(' AND ')}`;
      const eRes = await querySupabase(
        `SELECT lead_id, lead_nome, empreendimento, origem, status, para_nome,
                corretor, lead_data_cad, referencia_data, ativo
         FROM lead_milestones ${eWhere} ${modoEventsCond}
         ORDER BY lead_id, referencia_data ASC`,
        eParams
      );
      milestoneEvents = eRes.rows as LeadMilestoneEvent[];
    } catch (e) {
      console.warn('lead_milestones unavailable, skipping:', e);
    }

    // ── Supabase: view_lead_snapshot_mensal (status final por mês) ────────────
    // Usado para Lógica 3: último status do lead no mês Y de competência.
    let snapshotMensal: LeadSnapshotMensal[] = [];
    try {
      const sParams: unknown[] = [];
      const sConds: string[] = [];

      if (empreendimento !== 'all') {
        sParams.push(empreendimento);
        sConds.push(`empreendimento = $${sParams.length}`);
      }
      if (data_inicio) {
        sParams.push(data_inicio);
        sConds.push(`lead_data_cad >= $${sParams.length}`);
      }
      if (data_fim) {
        sParams.push(data_fim);
        sConds.push(`lead_data_cad <= $${sParams.length}`);
      }
      if (mes_competencia) {
        sParams.push(`${mes_competencia}%`);
        sConds.push(`CAST(competencia_data AS text) LIKE $${sParams.length}`);
      }

      const sWhere = sConds.length ? `WHERE ${sConds.join(' AND ')}` : '';
      const sRes = await querySupabase(
        `SELECT lead_id, lead_nome, origem, empreendimento, lead_data_cad,
                safra_data, competencia_data, status_final_mes, corretor, evento_data
         FROM view_lead_snapshot_mensal ${sWhere} ${modoSnapshotCond}
         ORDER BY lead_id, competencia_data ASC`,
        sParams
      );
      snapshotMensal = sRes.rows as LeadSnapshotMensal[];
    } catch (e) {
      console.warn('view_lead_snapshot_mensal unavailable, skipping:', e);
    }

    const total = firebaseTotal + supabaseTotal;
    const metrics = processMetrics(allLeads);

    // ── Lógica 1: status ATUAL dos leads (campo status_atual, tabela leads) ───
    const statusAtual = computeStatusDistribution(
      allLeads.map(l => l.status_atual)
    );

    // ── Lógica 2: status MAIS QUENTE já atingido por cada lead ───────────────
    // Usa lead_milestones: cada evento tem o status atingido naquele momento.
    // Para cada lead_id pega o evento com maior heat score (pico real do funil).
    const statusMaisQuente = computeStatusMaisQuente(milestoneEvents);

    // ── Lógica 3: último status do lead NO MÊS Y de competência ─────────────
    // Usa view_lead_snapshot_mensal filtrada por mes_competencia.
    // Para cada lead, pega o registro mais recente do mês selecionado.
    const statusNoMes = mes_competencia
      ? computeStatusNoMes(snapshotMensal)
      : null;

    const response = NextResponse.json({
      ...metrics,
      // ── Análises de status ────────────────────────────────────────────────
      statusAtual,
      statusMaisQuente,
      statusNoMes,
      mes_competencia: mes_competencia ?? null,
      modo,
      sources: {
        firebase: { total: firebaseTotal },
        supabase: { total: supabaseTotal, events_count: milestoneEvents.length, snapshot_count: snapshotMensal.length },
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
// Fonte: tabela lead_milestones (eventos individuais de transição de status).
// Cada linha = uma mudança de status (de_nome → para_nome / status).
// Para cada lead_id, percorre TODOS os seus eventos e seleciona
// o que tem o maior heat score — esse é o pico real do lead no funil.
// ─────────────────────────────────────────────────────────────────────────────
function computeStatusMaisQuente(events: LeadMilestoneEvent[]): StatusDistributionItem[] {
  // Agrupa todos os eventos por lead_id
  const byLead: Record<number, LeadMilestoneEvent[]> = {};
  for (const ev of events) {
    if (!byLead[ev.lead_id]) byLead[ev.lead_id] = [];
    byLead[ev.lead_id].push(ev);
  }

  // Para cada lead, seleciona o evento com maior score de calor
  const hotStatuses: string[] = [];
  for (const leadEvents of Object.values(byLead)) {
    const hottest = leadEvents.reduce((best, ev) => {
      return getHeatScore(ev.status) > getHeatScore(best.status) ? ev : best;
    });
    hotStatuses.push(hottest.status);
  }

  return computeStatusDistribution(hotStatuses);
}

// ─────────────────────────────────────────────────────────────────────────────
// Lógica 3 – Último status do lead NO MÊS Y de competência
//
// Fonte: view_lead_snapshot_mensal já filtrada por mes_competencia na query.
// Para cada lead_id, pega o snapshot mais recente do mês (maior evento_data).
// ─────────────────────────────────────────────────────────────────────────────
function computeStatusNoMes(snapshots: LeadSnapshotMensal[]): StatusDistributionItem[] {
  // Para cada lead_id, pega o snapshot mais recente dentro do mês
  const byLead: Record<number, LeadSnapshotMensal> = {};
  for (const snap of snapshots) {
    const existing = byLead[snap.lead_id];
    if (!existing || snap.evento_data > existing.evento_data) {
      byLead[snap.lead_id] = snap;
    }
  }

  const statuses = Object.values(byLead).map(s => s.status_final_mes);
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
      // Descartado (score negativo)
      byEmp[emp].descartes++; byMonth[mes].descartes++; total.descartes++;
    } else if (score < 10) {
      // Tentativas, aguardando, I.A., fila corretor, em atendimento (score 1-9)
      byEmp[emp].em_atendimento++; byMonth[mes].em_atendimento++; total.em_atendimento++;
    } else if (score === 10) {
      // Agendamento
      byEmp[emp].agendamento++; byMonth[mes].agendamento++; total.agendamento++;
    } else if (score === 11) {
      // Visita Realizada
      byEmp[emp].visita++; byMonth[mes].visita++; total.visita++;
    } else if (score >= 12) {
      // Em Tratativa (12), Com Reserva (13), Venda Realizada (14)
      byEmp[emp].venda++; byMonth[mes].venda++; total.venda++;
    }
  });

  return {
    byEmp,
    byMonth,
    total,
  };
}
