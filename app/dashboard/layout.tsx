'use client';

import { ReactNode } from 'react';
import { MarsalaSidebar } from '@/components/layout/MarsalaSidebar';
import { FiltersProvider } from '@/lib/filters-context';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <FiltersProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
          {/* Sidebar Marsala - Fixa na lateral esquerda */}
          <MarsalaSidebar />

          {/* Main Content - com margem para a sidebar no desktop */}
          <main className="flex-1 overflow-y-auto p-4 pt-20 lg:pt-8 lg:p-8 lg:ml-64">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </FiltersProvider>
    </ProtectedRoute>
  );
}
