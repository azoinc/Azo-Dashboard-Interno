'use client';

import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { FiltersProvider } from '@/lib/filters-context';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useMobileMenu } from '@/hooks/use-mobile-menu';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isOpen, open, close } = useMobileMenu();

  return (
    <ProtectedRoute>
      <FiltersProvider>
        <div className="flex min-h-screen bg-background">
          {/* Sidebar - Fixa na lateral esquerda */}
          <Sidebar isOpen={isOpen} onClose={close} />

          {/* Conteúdo principal - com margem para a sidebar no desktop */}
          <div className="flex-1 min-w-0 lg:ml-64">
            {/* Header Mobile - só aparece em telas pequenas */}
            <div className="lg:hidden">
              <MobileHeader onMenuClick={open} />
            </div>
            
            {/* Header Desktop - só aparece em telas grandes */}
            <div className="hidden lg:block">
              <Header />
            </div>
            
            {/* Main content - responsivo */}
            <main className="p-3 sm:p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
      </FiltersProvider>
    </ProtectedRoute>
  );
}
