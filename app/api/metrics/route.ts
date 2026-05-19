import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.' },
      { status: 503 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const empreendimento = searchParams.get('empreendimento') || 'all';
    const dataInicio = searchParams.get('data_inicio');
    const dataFim = searchParams.get('data_fim');

    // Query para métricas por empreendimento e mês
    let query = supabase
      .from('Leads')
      .select(`
        empreendimento,
        data_criacao_cv,
        status_atual
      `);

    // Filtro de período
    if (dataInicio && dataFim) {
      query = query.gte('data_criacao_cv', dataInicio).lte('data_criacao_cv', dataFim);
    }

    // Filtro de empreendimento
    if (empreendimento !== 'all') {
      query = query.eq('empreendimento', empreendimento);
    }

    const { data: leads, error } = await query;

    if (error) throw error;

    // Processar dados para calcular métricas
    const metrics = processMetrics(leads || []);

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

function processMetrics(leads: any[]) {
  const byEmp: Record<string, any> = {};
  const byMonth: Record<string, any> = {};
  const total: any = {
    leads: 0,
    descartes: 0,
    em_atendimento: 0,
    agendamento: 0,
    visita: 0,
    venda: 0,
  };

  leads.forEach((lead) => {
    const emp = lead.empreendimento;
    const mes = new Date(lead.data_criacao_cv).toISOString().slice(0, 7); // YYYY-MM

    // Inicializar se não existir
    if (!byEmp[emp]) {
      byEmp[emp] = {
        leads: 0,
        descartes: 0,
        em_atendimento: 0,
        agendamento: 0,
        visita: 0,
        venda: 0,
      };
    }
    if (!byMonth[mes]) {
      byMonth[mes] = {
        leads: 0,
        descartes: 0,
        em_atendimento: 0,
        agendamento: 0,
        visita: 0,
        venda: 0,
      };
    }

    // Contar leads
    byEmp[emp].leads++;
    byMonth[mes].leads++;
    total.leads++;

    // Contar por status
    const status = lead.status_atual;

    if (status === 'Descartado') {
      byEmp[emp].descartes++;
      byMonth[mes].descartes++;
      total.descartes++;
    } else if (
      ['Em Atendimento', '2º Tentativa', '3º Tentativa', '4º Tentativa', 'Aguardando Atendimento do do'].includes(
        status
      )
    ) {
      byEmp[emp].em_atendimento++;
      byMonth[mes].em_atendimento++;
      total.em_atendimento++;
    } else if (status.includes('Agendamento')) {
      byEmp[emp].agendamento++;
      byMonth[mes].agendamento++;
      total.agendamento++;
    } else if (status === 'Visitou') {
      byEmp[emp].visita++;
      byMonth[mes].visita++;
      total.visita++;
    } else if (status === 'Vendido') {
      byEmp[emp].venda++;
      byMonth[mes].venda++;
      total.venda++;
    }
  });

  return {
    byEmp,
    byMonth,
    total,
  };
}
