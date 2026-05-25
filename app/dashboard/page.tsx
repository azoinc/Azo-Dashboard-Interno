'use client';

import Link from 'next/link';
import { LayoutGrid, Users } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function DashboardHomePage() {
  const { user, isMaster, isAdmin, isDiretoria, loading } = useAuth();
  const router = useRouter();

  // Redireciona usuários não-Master diretamente para Financeiro
  useEffect(() => {
    if (!loading && user && !isMaster()) {
      router.push('/dashboard/financeiro');
    }
  }, [user, loading, isMaster, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  // Se não for Master, mostra mensagem de redirecionamento
  if (!isMaster()) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Redirecionando...</div>
      </div>
    );
  }

  // Master of Universe vê os dois cards
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Selecione o Dashboard
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Escolha qual área você deseja acessar
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Card Comercial / Mkt */}
        <Link
          href="/dashboard/financeiro"
          className="group bg-card border border-border rounded-2xl p-5 sm:p-6 lg:p-8 hover:shadow-lg hover:border-[#8B2356]/30 transition-all"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 sm:mb-5">
            <LayoutGrid className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
            Dashboard<br />Comercial / Mkt
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            Acompanhamento de vendas, VGV, leads, visitas e despesas de marketing dos empreendimentos.
          </p>
        </Link>

        {/* Card Interno Mkt */}
        <Link
          href="/dashboard/marketing"
          className="group bg-card border border-border rounded-2xl p-5 sm:p-6 lg:p-8 hover:shadow-lg hover:border-violet-500/30 transition-all"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-violet-100 flex items-center justify-center mb-4 sm:mb-5">
            <Users className="w-6 h-6 sm:w-7 sm:h-7 text-violet-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
            Interno Mkt
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            Acompanhamento de métricas internas, equipe e processos do departamento de marketing.
          </p>
        </Link>
      </div>
    </div>
  );
}
