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

    let query = supabase.from('investimento').select('*');

    if (empreendimento !== 'all') {
      query = query.eq('empreendimento', empreendimento);
    }

    if (dataInicio && dataFim) {
      query = query.gte('mes_ref', dataInicio).lte('mes_ref', dataFim);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching investment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investment data' },
      { status: 500 }
    );
  }
}
