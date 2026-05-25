import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Nota: O Firebase Auth roda no client-side (IndexedDB).
// O middleware Next.js não tem acesso ao estado de auth do Firebase.
// A proteção de rotas é feita no client via AuthContext.
// Este middleware serve apenas para headers de segurança.

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Adiciona headers de segurança
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
