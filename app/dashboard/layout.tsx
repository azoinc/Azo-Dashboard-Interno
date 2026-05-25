'use client';

import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AuthProvider } from '@/lib/auth-context';
import { FiltersProvider } from '@/lib/filters-context';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <FiltersProvider>
        <div className="flex min-h-screen bg-background">
          {/* Sidebar fixa */}
          <Sidebar />

          {/* Conteúdo principal */}
          <div className="flex-1 ml-64">
            <Header />
            <main className="p-6">{children}</main>
          </div>
        </div>
      </FiltersProvider>
    </AuthProvider>
  );
}
