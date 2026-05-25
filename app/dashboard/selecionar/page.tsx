'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LayoutGrid, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SelecionarDashboardPage() {
  const { user, isMaster, loading } = useAuth();
  const router = useRouter();
  const [selectedDashboard, setSelectedDashboard] = useState<'comercial' | 'interno' | null>(null);

  useEffect(() => {
    if (!loading && !isMaster()) {
      // Se não for MASTER, vai direto para o dashboard comercial
      router.push('/dashboard/marketing');
    }
  }, [isMaster, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  // Se não for MASTER, mostra mensagem de redirecionamento
  if (!isMaster()) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Redirecionando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Selecione o Dashboard
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Escolha qual área você deseja acessar
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* Card Comercial / Mkt */}
        <Link
          href="/dashboard/marketing"
          className="group bg-card border border-border rounded-2xl p-6 sm:p-8 hover:shadow-xl hover:border-emerald-500/30 transition-all"
        >
          <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <LayoutGrid className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-3">
            Dashboard<br />Comercial / Mkt
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Acompanhamento de vendas, VGV, leads, visitas e despesas de marketing dos empreendimentos.
          </p>
          <div className="flex items-center text-emerald-600 text-sm font-medium">
            Acessar <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card Interno Mkt */}
        <Link
          href="/dashboard/interno-mkt"
          className="group bg-card border border-border rounded-2xl p-6 sm:p-8 hover:shadow-xl hover:border-violet-500/30 transition-all"
        >
          <div className="w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
            <Users className="w-7 h-7 text-violet-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-3">
            Interno Mkt
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Acompanhamento de métricas internas, equipe e processos do departamento de marketing.
          </p>
          <div className="flex items-center text-violet-600 text-sm font-medium">
            Acessar <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
