'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { user, firebaseUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Se não estiver autenticado no Firebase, redireciona para login
    if (!firebaseUser) {
      console.log('ProtectedRoute: Usuário não autenticado, redirecionando para login');
      router.push('/login');
      return;
    }

    // Se estiver autenticado no Firebase mas não tem dados no Firestore
    if (!user) {
      console.log('ProtectedRoute: Usuário autenticado mas sem dados no Firestore');
      // Não redireciona imediatamente, pode estar carregando
      return;
    }
  }, [user, firebaseUser, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, mostra tela de carregamento enquanto redireciona
  if (!firebaseUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
