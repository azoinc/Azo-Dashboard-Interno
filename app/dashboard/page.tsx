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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Bem-vindo, Master of Universe</h1>
        <p className="text-muted-foreground text-lg">
          Selecione a área que deseja acessar
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Botão Financeiro */}
        <Link
          href="/dashboard/financeiro"
          className="group bg-card border border-border rounded-xl p-8 hover:border-primary hover:shadow-lg transition-all"
        >
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
            Financeiro
          </h2>
          <p className="text-muted-foreground">
            Acesso completo aos dados financeiros, lançamentos, comercial e relatórios institucionais
          </p>
        </Link>

        {/* Botão Marketing */}
        <Link
          href="/dashboard/marketing"
          className="group bg-card border border-border rounded-xl p-8 hover:border-violet-500 hover:shadow-lg transition-all"
        >
          <div className="text-6xl mb-4">📢</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:text-violet-500 transition-colors">
            Marketing
          </h2>
          <p className="text-muted-foreground">
            Dashboard de marketing com integração Sienge, leads, investimentos e análises
          </p>
        </Link>
      </div>
    </div>
  );
}
