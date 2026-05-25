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
          {/* Sidebar - Drawer no mobile, fixa no desktop */}
          <Sidebar isOpen={isOpen} onClose={close} />

          {/* Conteúdo principal */}
          <div className="flex-1 lg:ml-0 min-w-0">
            {/* Header Mobile */}
            <MobileHeader onMenuClick={open} />
            
            {/* Header Desktop */}
            <Header />
            
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
