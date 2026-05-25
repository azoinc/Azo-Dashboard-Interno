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

  if (loading) return <div className="flex items-center justify-center h-64 sm:h-96 text-sm">Carregando...</div>;
  if (!isMaster()) return <div className="flex items-center justify-center h-64 sm:h-96 text-sm">Redirecionando...</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Marketing</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Dashboard de marketing e leads</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground">Leads Orgânicos</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2">1.847</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground">Leads Ação MKT</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2">1.000</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground">Visitas Realizadas</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2">892</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm text-muted-foreground">Taxa de Conversão</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1 sm:mt-2">23.5%</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6">
          <h3 className="font-semibold mb-2 sm:mb-4 text-sm sm:text-base">Evolução de Leads</h3>
          <div className="h-48 sm:h-64 flex items-center justify-center text-muted-foreground text-xs sm:text-sm">[Gráfico de Leads]</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6">
          <h3 className="font-semibold mb-2 sm:mb-4 text-sm sm:text-base">Investimento por Canal</h3>
          <div className="h-48 sm:h-64 flex items-center justify-center text-muted-foreground text-xs sm:text-sm">[Gráfico de Investimento]</div>
        </div>
      </div>
    </div>
  );
}
