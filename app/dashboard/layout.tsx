'use client';

import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { FiltersProvider } from '@/lib/filters-context';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  );
}
