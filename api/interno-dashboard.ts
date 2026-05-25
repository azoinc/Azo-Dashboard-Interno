import { executeQuery } from './_lib/db';

const PROJECTS_BY_CITY: Record<string, string[]> = {
  'Rio de Janeiro': ['Gávea', 'Ar Ipanema', 'Insigna Peninsula', 'A Noite'],
  'Campinas': ['Ares Home', 'Verter Cambui', 'Casa da Mata', 'Natus'],
};

const MONTH_NAMES_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function monthLabel(iso: string): string {
  try {
    const parts = iso.substring(0, 10).split('-');
    return `${MONTH_NAMES_PT[parseInt(parts[1]) - 1]} ${parts[0]}`;
  } catch { return iso; }
}

function lastDayOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function isAction(text: string | null | undefined): boolean {
  const t = (text || '').toLowerCase();
  return t.includes('ação') || t.includes('acao');
}

function normalizeStatus(raw: string | null | undefined): string {
  const st = (raw || 'Sem Status').trim();
  const sl = st.toLowerCase();
  if (sl.includes('atendimento i.a') || sl.includes('atendimentoi.a') || sl.includes('atendimento ia')) return 'Em AtendimentoI.A.';
  if (sl.includes('aguardando atendimento do corretor') || sl.includes('aguardando atendimento corretor') || sl.includes('fila do corretor')) return 'Aguardando Atendimento Corretor';
  if (sl.includes('aguardando atendimento') && !sl.includes('corretor')) return 'Aguardando Atendimento';
  if (sl === 'em atendimento') return 'Em Atendimento';
  if (sl.includes('3ºtentativa') || sl.includes('3 tentativa') || sl.includes('terceira tentativa')) return '3ºTentativa';
  if (sl.includes('2ºtentativa') || sl.includes('2 tentativa') || sl.includes('segunda tentativa')) return '2ºTentativa';
  if (sl.includes('agendado') || sl.includes('agendamento')) return 'Agendamento';
  if (sl.includes('visita')) return 'Visita Realizada';
  if (sl.includes('reserva')) return 'Com Reserva';
  if (sl.includes('proposta') || sl.includes('negocia')) return 'Proposta / Negociação';
  if (sl.includes('venda') || sl.includes('contrato')) return 'Venda Realizada';
  if (sl.includes('descartad')) return 'Descartado';
  return st;
}

function normalizeOrigin(raw: string | null | undefined): string {
  const o = (raw || '').toLowerCase();
  if (['facebook','fb','instagram','ig','meta'].some(x => o.includes(x))) return 'Facebook';
  if (['google','adwords'].some(x => o.includes(x))) return 'Google';
  if (['site','organico','orgânico','seo'].some(x => o.includes(x))) return 'Site';
  return 'Outros';
}

function resolveDates(f: any): [Date, Date] {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const period = f.period || 'Todo o período';
  if (period === 'Todo o período') return [new Date(2020, 0, 1), today];
  if (period === 'Últimos 30 dias') { const s = new Date(); s.setDate(s.getDate() - 30); return [s, today]; }
  if (period === 'Este mês' || period === 'Mês Atual') return [new Date(today.getFullYear(), today.getMonth(), 1), today];
  if (period === 'Mês passado' || period === 'Mês Passado') {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastPrev = new Date(first.getTime() - 86400000);
    return [new Date(lastPrev.getFullYear(), lastPrev.getMonth(), 1), lastPrev];
  }
  if (period === 'Personalizado' && f.start_date && f.end_date)
    return [new Date(f.start_date + 'T00:00:00'), new Date(f.end_date + 'T23:59:59')];
  return [new Date(today.getFullYear(), today.getMonth(), 1), today];
}

function buildProjectFilter(f: any): [string, any[]] {
  if (f.project && f.project !== 'Todos') return ['AND "empreendimento" ILIKE $1', [`%${f.project}%`]];
  if (f.city && f.city !== 'ALL') {
    const projs = PROJECTS_BY_CITY[f.city] || [];
    if (projs.length) {
      const phs = projs.map((_: any, i: number) => `$${i + 1}`).join(', ');
      return [`AND "empreendimento" IN (${phs})`, projs];
    }
  }
  return ['', []];
}

function chunks<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

async function queryChunked(table: string, select: string, idColumn: string, ids: string[], extraSql = '', extraParams: any[] = []): Promise<any[]> {
  const rows: any[] = [];
  for (const chunk of chunks(ids, 500)) {
    const phs = chunk.map((_, i) => `$${i + 1}`).join(', ');
    const offsetParams = chunk.map((_, i) => `$${i + 1 + chunk.length}`);
    const sql = `SELECT ${select} FROM "${table}" WHERE "${idColumn}" IN (${phs}) ${extraSql.replace(/\$(\d+)/g, (_, n) => `$${parseInt(n) + chunk.length}`)} LIMIT 100000`;
    const result = await executeQuery(sql, [...chunk, ...extraParams]);
    rows.push(...result);
  }
  return rows;
}

async function compute(f: any): Promise<any> {
  const [start, end] = resolveDates(f);
  const competences: string[] = f.competences || ['Atual'];
  const hasComp = competences.length > 0 && !competences.includes('Atual');

  const startStr = start.toISOString().split('T')[0] + 'T00:00:00.000Z';
  const endStr = end.toISOString().split('T')[0] + 'T23:59:59.999Z';

  const [projSql, projParams] = buildProjectFilter(f);
  const brokerSql = f.broker && f.broker !== 'Todos' ? 'AND "corretor" ILIKE $BROKER' : '';
  const brokerParam = f.broker && f.broker !== 'Todos' ? [`%${f.broker}%`] : [];

  let rawLeads: any[] = [];

  if (hasComp) {
    const compDates = competences.map((c: string) => new Date(c.substring(0, 10) + 'T00:00:00'));
    const compStart = new Date(Math.min(...compDates.map(d => d.getTime())));
    const compEnd = lastDayOfMonth(new Date(Math.max(...compDates.map(d => d.getTime()))));
    const snapRows = await executeQuery(
      `SELECT lead_id FROM "view_lead_snapshot_mensal" WHERE "competencia_data" >= $1 AND "competencia_data" <= $2 LIMIT 100000`,
      [compStart.toISOString().split('T')[0], compEnd.toISOString().split('T')[0]]
    );
    const snapIds = [...new Set(snapRows.map((r: any) => String(r.lead_id)).filter(Boolean))];

    for (const chunk of chunks(snapIds, 1000)) {
      const phs = chunk.map((_: any, i: number) => `$${i + 1}`).join(', ');
      let paramOffset = chunk.length;
      let sql = `SELECT status_atual, nome, id_cv, data_criacao_cv, origem, motivo_cancelamento, corretor, empreendimento, update_at FROM "leads" WHERE "id_cv" IN (${phs}) AND "data_criacao_cv" >= $${++paramOffset} AND "data_criacao_cv" <= $${++paramOffset}`;
      const params: any[] = [...chunk, startStr, endStr];
      if (projSql) {
        sql += ' ' + projSql.replace(/\$(\d+)/g, (_: any, n: string) => `$${parseInt(n) + paramOffset}`);
        params.push(...projParams);
        paramOffset += projParams.length;
      }
      if (brokerSql) {
        sql += ` AND "corretor" ILIKE $${++paramOffset}`;
        params.push(...brokerParam);
      }
      sql += ' LIMIT 100000';
      rawLeads.push(...await executeQuery(sql, params));
    }
  } else {
    let paramOffset = 0;
    let sql = `SELECT status_atual, nome, id_cv, data_criacao_cv, origem, motivo_cancelamento, corretor, empreendimento, update_at FROM "leads" WHERE "data_criacao_cv" >= $${++paramOffset} AND "data_criacao_cv" <= $${++paramOffset}`;
    const params: any[] = [startStr, endStr];
    if (projSql) {
      sql += ' ' + projSql.replace(/\$(\d+)/g, (_: any, n: string) => `$${parseInt(n) + paramOffset}`);
      params.push(...projParams);
      paramOffset += projParams.length;
    }
    if (brokerSql) {
      sql += ` AND "corretor" ILIKE $${++paramOffset}`;
      params.push(...brokerParam);
    }
    sql += ' LIMIT 100000';
    rawLeads = await executeQuery(sql, params);
  }

  // Excluir leads de "ação"
  const excluded = new Set(rawLeads
    .filter(r => ['status_atual','motivo_cancelamento','origem'].some(k => isAction(r[k])) && r.id_cv)
    .map(r => String(r.id_cv)));

  let leads = rawLeads
    .filter(r => !excluded.has(String(r.id_cv)))
    .map(r => {
      const st = normalizeStatus(r.status_atual);
      return {
        id: String(r.id_cv), nome: r.nome, status_atual: st,
        lead_data_cad: r.data_criacao_cv ? String(r.data_criacao_cv) : null,
        origem: r.origem, origin_treated: normalizeOrigin(r.origem),
        motivo_cancelamento_treated: (r.motivo_cancelamento || '').trim() || null,
        corretor: r.corretor, empreendimento: r.empreendimento,
        update_at: r.update_at ? String(r.update_at) : null,
      };
    })
    .filter(l => !isAction(l.status_atual));

  const leadIds = leads.map(l => l.id);

  // Dados complementares
  const [snapshotRows, funnelRowsRaw, tmaRows, actionsRows] = await Promise.all([
    leadIds.length ? queryChunked('view_lead_snapshot_mensal', 'status_final_mes, competencia_data, lead_id', 'lead_id', leadIds) : [],
    leadIds.length ? queryChunked('view_funil_maximo_com_total', 'etapa_visual, lead_id', 'lead_id', leadIds) : [],
    leadIds.length ? queryChunked('view_tma_fila_atendimento', 'corretor, segundos_espera', 'lead_id', leadIds) : [],
    leadIds.length ? queryChunked('view_esforco_corretor', 'corretor, lead_id', 'lead_id', leadIds) : [],
  ]);

  let funnelRows = funnelRowsRaw;

  // Override status para competências históricas
  if (hasComp) {
    const selMonths = competences.map((c: string) => c.substring(0, 7));
    const valid = new Map<string, string>();
    for (const snap of snapshotRows) {
      const snapMonth = String(snap.competencia_data || '').substring(0, 7);
      if (selMonths.includes(snapMonth)) {
        const st = String(snap.status_final_mes || '');
        if (!isAction(st)) valid.set(String(snap.lead_id), st);
      }
    }
    leads = leads.filter(l => valid.has(l.id)).map(l => ({ ...l, status_atual: normalizeStatus(valid.get(l.id)) }));

    // Funil sintético
    funnelRows = [];
    for (const lead of leads) {
      const st = (lead.status_atual || '').toLowerCase();
      const lid = lead.id;
      funnelRows.push({ lead_id: lid, etapa_visual: '1. Total de Leads' });
      if (!st.includes('aguardando')) funnelRows.push({ lead_id: lid, etapa_visual: '2. Em Atendimento' });
      if (['agendam','agendado','visita','reserva','proposta','negocia','venda','contrato'].some(x => st.includes(x))) funnelRows.push({ lead_id: lid, etapa_visual: '3. Agendamento' });
      if (['visita','reserva','proposta','negocia','venda','contrato'].some(x => st.includes(x))) funnelRows.push({ lead_id: lid, etapa_visual: '4. Visita Realizada' });
      if (['proposta','negocia','reserva','venda','contrato'].some(x => st.includes(x))) funnelRows.push({ lead_id: lid, etapa_visual: '5. Proposta / Negociação' });
      if (['reserva','venda','contrato'].some(x => st.includes(x))) funnelRows.push({ lead_id: lid, etapa_visual: '6. Com Reserva' });
      if (['venda','contrato'].some(x => st.includes(x))) funnelRows.push({ lead_id: lid, etapa_visual: '7. Venda Realizada' });
    }
  }

  const globalAvailableStatuses = [...new Set(leads.map(l => l.status_atual || 'Sem Status'))].sort();

  // Filtros globais
  if (f.origin && f.origin !== 'Todas') leads = leads.filter(l => l.origin_treated === f.origin);
  if (f.status && f.status !== 'Todos') leads = leads.filter(l => (l.status_atual || 'Sem Status') === f.status);

  const leadsBeforeMonth = new Set(leads.map(l => l.id));

  if (f.interactive_origin) leads = leads.filter(l => l.origin_treated === f.interactive_origin);
  if (f.interactive_cancel_reason) leads = leads.filter(l => l.motivo_cancelamento_treated === f.interactive_cancel_reason);

  if (f.interactive_month) {
    const monthStatuses = new Map<string, string>();
    const matching = new Set<string>();
    for (const snap of snapshotRows) {
      const lbl = monthLabel(String(snap.competencia_data || ''));
      const st = normalizeStatus(snap.status_final_mes);
      if (lbl === f.interactive_month) {
        if (f.interactive_status ? st === f.interactive_status : true) {
          matching.add(String(snap.lead_id));
          monthStatuses.set(String(snap.lead_id), st);
        }
      }
    }
    leads = leads.filter(l => matching.has(l.id)).map(l => ({ ...l, status_atual: monthStatuses.get(l.id) || l.status_atual }));
  } else if (f.interactive_status) {
    leads = leads.filter(l => (l.status_atual || 'Sem Status') === f.interactive_status);
  }

  const activeIds = new Set(leads.map(l => l.id));

  // Contagens
  const statusCounts: Record<string, number> = {};
  const originCounts: Record<string, number> = {};
  const cancelCounts: Record<string, number> = {};
  const brokerCounts: Record<string, number> = {};
  const lineMap: Record<string, any> = {};
  const funnelSteps: Record<string, number> = {
    '00. Total de Leads': leads.length,
    '01. Em AtendimentoI.A.': 0, '02. Aguardando Atendimento Corretor': 0,
    '03. Aguardando Atendimento': 0, '04. Em Atendimento': 0,
    '05. 2ºTentativa': 0, '06. 3ºTentativa': 0, '07. Agendamento': 0,
    '08. Visita Realizada': 0, '09. Proposta / Negociação': 0,
    '10. Com Reserva': 0, '11. Venda Realizada': 0, '12. Descartado': 0,
  };
  const stepMap: Record<string, string> = {
    'Em AtendimentoI.A.': '01. Em AtendimentoI.A.', 'Aguardando Atendimento Corretor': '02. Aguardando Atendimento Corretor',
    'Aguardando Atendimento': '03. Aguardando Atendimento', 'Em Atendimento': '04. Em Atendimento',
    '2ºTentativa': '05. 2ºTentativa', '3ºTentativa': '06. 3ºTentativa', 'Agendamento': '07. Agendamento',
    'Visita Realizada': '08. Visita Realizada', 'Proposta / Negociação': '09. Proposta / Negociação',
    'Com Reserva': '10. Com Reserva', 'Venda Realizada': '11. Venda Realizada', 'Descartado': '12. Descartado',
  };

  let eCount = 0, aCount = 0, vCount = 0, pCount = 0, cCount = 0, rCount = 0, descCount = 0;

  for (const lead of leads) {
    const st = lead.status_atual || 'Sem Status';
    statusCounts[st] = (statusCounts[st] || 0) + 1;
    originCounts[lead.origin_treated] = (originCounts[lead.origin_treated] || 0) + 1;
    if (lead.motivo_cancelamento_treated) cancelCounts[lead.motivo_cancelamento_treated] = (cancelCounts[lead.motivo_cancelamento_treated] || 0) + 1;
    brokerCounts[lead.corretor || 'Sem Corretor'] = (brokerCounts[lead.corretor || 'Sem Corretor'] || 0) + 1;
    if (stepMap[st]) funnelSteps[stepMap[st]]++;
    if (st === 'Descartado') descCount++;
    else if (st === 'Em Atendimento') eCount++;
    else if (st === 'Agendamento') aCount++;
    else if (st === 'Visita Realizada') vCount++;
    else if (st === 'Proposta / Negociação') pCount++;
    else if (st === 'Com Reserva') cCount++;
    else if (st === 'Venda Realizada') rCount++;

    const cad = lead.lead_data_cad || '';
    if (cad.length >= 7) {
      const parts = cad.substring(0, 10).split('-');
      const monthNum = parseInt(parts[1]);
      if (monthNum >= 1 && monthNum <= 12) {
        const lbl = `${MONTH_NAMES_PT[monthNum - 1]} ${parts[0]}`;
        const sk = `${parts[0]}-${parts[1].padStart(2, '0')}`;
        if (!lineMap[sk]) lineMap[sk] = { date: lbl, sort_key: sk };
        const emp = lead.empreendimento || 'Outros';
        lineMap[sk][emp] = (lineMap[sk][emp] || 0) + 1;
      }
    }
  }

  // Hottest score
  const hottestScore: Record<string, number> = {};
  for (const row of funnelRows) {
    const lid = String(row.lead_id);
    if (!activeIds.has(lid)) continue;
    const etapa = (row.etapa_visual || '').toLowerCase();
    if (isAction(etapa)) continue;
    let score = 0;
    if (etapa.includes('venda')) score = 4;
    else if (etapa.includes('proposta') || etapa.includes('negocia')) score = 3;
    else if (etapa.includes('visita')) score = 2;
    else if (etapa.includes('agendamento') || etapa.includes('agendado')) score = 1;
    if (score > (hottestScore[lid] || 0)) hottestScore[lid] = score;
  }

  // Stacked status
  const selMonthsForSnap = hasComp ? competences.map((c: string) => c.substring(0, 7)) : [];
  const stackedMap: Record<string, Record<string, Set<string>>> = {};
  const monthsSet = new Set<string>();
  const monthRaw: Record<string, string> = {};

  for (const snap of snapshotRows) {
    const lid = String(snap.lead_id);
    if (!leadsBeforeMonth.has(lid)) continue;
    const st = normalizeStatus(snap.status_final_mes);
    if (isAction(st)) continue;
    const comp = String(snap.competencia_data || '');
    if (!comp) continue;
    if (hasComp && !selMonthsForSnap.includes(comp.substring(0, 7))) continue;
    const lbl = monthLabel(comp);
    monthsSet.add(lbl);
    monthRaw[lbl] = comp;
    if (!stackedMap[st]) stackedMap[st] = {};
    if (!stackedMap[st][lbl]) stackedMap[st][lbl] = new Set();
    stackedMap[st][lbl].add(lid);
  }

  const availableMonths = [...monthsSet].sort((a, b) => (monthRaw[a] || '').localeCompare(monthRaw[b] || ''));
  const stackedStatusData = Object.entries(stackedMap).map(([status, monthsData]) => {
    const obj: any = { status };
    let total = 0;
    for (const m of availableMonths) { const c = monthsData[m]?.size || 0; obj[m] = c; total += c; }
    obj.total = total;
    return obj;
  }).filter(d => d.total > 0).sort((a, b) => b.total - a.total);

  // TMA
  const tmaSums: Record<string, number> = {};
  const tmaCounts: Record<string, number> = {};
  for (const row of tmaRows) {
    const n = row.corretor || 'Desconhecido';
    tmaSums[n] = (tmaSums[n] || 0) + Number(row.segundos_espera || 0);
    tmaCounts[n] = (tmaCounts[n] || 0) + 1;
  }
  const brokerTimeData = Object.keys(tmaSums).map(n => ({ name: n, time: Math.round(tmaSums[n] / tmaCounts[n] * 100) / 100 })).sort((a, b) => b.time - a.time);

  const actionsCnt: Record<string, number> = {};
  for (const row of actionsRows) actionsCnt[row.corretor || 'Desconhecido'] = (actionsCnt[row.corretor || 'Desconhecido'] || 0) + 1;
  const brokerActionsData = Object.entries(actionsCnt).map(([name, actions]) => ({ name, actions })).sort((a, b) => b.actions - a.actions);

  const STEP_LABELS: Record<number, string> = { 1: 'Agendamento', 2: 'Visita', 3: 'Proposta', 4: 'Venda' };
  const hottestList: any[] = [], allList: any[] = [];
  for (const lead of leads) {
    const score = hottestScore[lead.id] || 0;
    const item = { id: lead.id, nome: lead.nome || 'Sem Nome', empreendimento: lead.empreendimento, corretor: lead.corretor, maxStep: STEP_LABELS[score] || '-', data_entrada: lead.lead_data_cad, status_atual: lead.status_atual, data_update_status: lead.update_at };
    allList.push(item);
    if (score > 0) hottestList.push(item);
  }

  const empTotals: Record<string, number> = {};
  for (const lead of leads) empTotals[lead.empreendimento || 'Outros'] = (empTotals[lead.empreendimento || 'Outros'] || 0) + 1;
  const lineChartKeys = Object.entries(empTotals).sort((a, b) => b[1] - a[1]).map(e => e[0]);

  return {
    totalLeads: leads.length,
    statusData: Object.entries(statusCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    funnelData: Object.entries(funnelSteps).filter(([n, v]) => v > 0 || n.includes('Total') || n.includes('Em Atendimento')).sort((a, b) => a[0].localeCompare(b[0])).map(([name, value]) => ({ name, value })),
    stackedStatusData, availableMonths,
    originData: Object.entries(originCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    cancelReasons: Object.entries(cancelCounts).map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count),
    brokerLeads: Object.entries(brokerCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    brokerTimeData, brokerActionsData,
    lineData: Object.values(lineMap).sort((a, b) => a.sort_key.localeCompare(b.sort_key)),
    lineChartKeys,
    hottestStatusData: { emAtendimento: eCount, visita: vCount, proposta: pCount, reserva: cCount, agendamento: aCount, venda: rCount, descartado: descCount },
    hottestLeadsList: hottestList, allLeadsList: allList,
    hasSpecificCompetences: hasComp, globalAvailableStatuses,
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const result = await compute(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('interno-dashboard error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
}
