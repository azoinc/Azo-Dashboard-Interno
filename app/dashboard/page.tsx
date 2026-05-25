'use client';

import Link from 'next/link';
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

  // Master of Universe vê os dois botões
  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-4">
          Bem-vindo, Master of Universe
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
          Selecione a área que deseja acessar
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Botão Financeiro */}
        <Link
          href="/dashboard/financeiro"
          className="group bg-card border border-border rounded-xl p-4 sm:p-6 lg:p-8 hover:border-primary hover:shadow-lg transition-all"
        >
          <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">💰</div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 group-hover:text-primary transition-colors">
            Financeiro
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Acesso completo aos dados financeiros, lançamentos, comercial e relatórios institucionais
          </p>
        </Link>

        {/* Botão Marketing */}
        <Link
          href="/dashboard/marketing"
          className="group bg-card border border-border rounded-xl p-4 sm:p-6 lg:p-8 hover:border-violet-500 hover:shadow-lg transition-all"
        >
          <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">📢</div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 group-hover:text-violet-500 transition-colors">
            Marketing
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Dashboard de marketing com integração Sienge, leads, investimentos e análises
          </p>
        </Link>
      </div>
    </div>
  );
}
