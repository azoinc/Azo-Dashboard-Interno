'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function MarketingPage() {
  const { isMaster, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isMaster()) {
      router.push('/dashboard/financeiro');
    }
  }, [isMaster, loading, router]);

  if (loading) return <div className="flex items-center justify-center h-96">Carregando...</div>;
  if (!isMaster()) return <div className="flex items-center justify-center h-96">Redirecionando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Marketing</h1>
        <p className="text-muted-foreground">Dashboard de marketing e leads</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Leads Orgânicos</p>
          <p className="text-3xl font-bold mt-2">1.847</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Leads Ação MKT</p>
          <p className="text-3xl font-bold mt-2">1.000</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Visitas Realizadas</p>
          <p className="text-3xl font-bold mt-2">892</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
          <p className="text-3xl font-bold mt-2">23.5%</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Evolução de Leads</h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">[Gráfico de Leads]</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Investimento por Canal</h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">[Gráfico de Investimento]</div>
        </div>
      </div>
    </div>
  );
}
