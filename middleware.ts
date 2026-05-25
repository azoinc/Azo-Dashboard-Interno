import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = ['/login', '/api/auth'];

// Rotas por permissão necessária
const PROTECTED_ROUTES: Record<string, string> = {
  '/dashboard/admin': 'admin:manage',
  '/dashboard/financeiro': 'financeiro:view',
  '/dashboard/comercial': 'comercial:view',
  '/dashboard/institucional': 'institucional:view',
  '/dashboard/timeline': 'timeline:view',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permite rotas públicas
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verifica se há token de autenticação (Firebase Auth token no cookie)
  const authToken = request.cookies.get('firebase-auth-token')?.value;

  // Se não estiver autenticado e tentar acessar dashboard, redireciona para login
  if (!authToken && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verifica permissões específicas (simplificado - a verificação real é feita no client)
  // O middleware não tem acesso ao Firestore, então só verificamos se está autenticado

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
  ],
};
