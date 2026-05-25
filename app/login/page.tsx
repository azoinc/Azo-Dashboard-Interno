'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { usePasskeys } from '@/lib/use-passkeys';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);
  
  const { signIn } = useAuth();
  const router = useRouter();
  const { 
    isSupported, 
    isAuthenticating, 
    authenticateWithPasskey, 
    error: passkeyError,
    clearError: clearPasskeyError 
  } = usePasskeys();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    clearPasskeyError();

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Erro de login:', err);
      console.error('Código do erro:', err?.code);
      console.error('Mensagem do erro:', err?.message);
      
      const errorMessages: Record<string, string> = {
        'auth/invalid-email': 'E-mail inválido',
        'auth/user-disabled': 'Usuário desativado',
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/invalid-credential': 'Credenciais inválidas',
        'auth/too-many-requests': 'Muitas tentativas. Tente mais tarde',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
        'auth/invalid-api-key': 'Chave de API inválida - verifique as configurações',
        'auth/app-not-authorized': 'App não autorizado',
      };
      
      setError(errorMessages[err?.code] || `Erro: ${err?.message || 'E-mail ou senha inválidos'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setError('');
    clearPasskeyError();
    
    const result = await authenticateWithPasskey(email || undefined);
    
    if (result.success && result.user) {
      // Autenticação com Passkey bem-sucedida
      // Precisamos fazer login no Firebase também para ter o token
      try {
        // Se autenticou com Passkey mas não tem email, redireciona
        if (!result.user.email) {
          setError('Erro: usuário sem email associado');
          return;
        }
        
        // Armazena os dados do usuário temporariamente
        // Na prática, você pode querer criar uma sessão customizada
        // ou usar um token JWT separado do Firebase
        router.push('/dashboard');
      } catch (err) {
        setError('Autenticação com Passkey falhou na sincronização');
      }
    }
  };

  const handlePasskeyPrompt = () => {
    setShowPasskeyPrompt(true);
    handlePasskeyLogin();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4 lg:p-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Azo Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Faça login para continuar</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 sm:py-2.5 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 sm:py-2.5 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="••••••••"
              />
            </div>

            {(error || passkeyError) && (
              <div className="text-destructive text-xs sm:text-sm bg-destructive/10 p-2.5 sm:p-3 rounded-lg">
                {error || passkeyError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2.5 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
            >
              {loading ? 'Entrando...' : 'Entrar com E-mail e Senha'}
            </button>
          </form>

          {/* Divisor */}
          <div className="relative my-4 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Login com Passkey */}
          {isSupported ? (
            <button
              onClick={handlePasskeyPrompt}
              disabled={isAuthenticating}
              className="w-full border border-border bg-background text-foreground py-2.5 px-4 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" />
                <path d="M12 14v8" />
                <path d="M8 18h8" />
              </svg>
              {isAuthenticating ? 'Verificando...' : 'Entrar com Passkey'}
            </button>
          ) : (
            <div className="text-center text-xs sm:text-sm text-muted-foreground p-2.5 sm:p-3 bg-muted rounded-lg">
              ⚠️ Seu navegador não suporta Passkeys. Use e-mail e senha.
            </div>
          )}

          {/* Info sobre Passkeys */}
          <div className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted-foreground text-center">
            <p>
              🔐 <strong>O que é Passkey?</strong>
            </p>
            <p className="mt-1">
              Login sem senha usando biometria ou chave de segurança. Mais seguro!
            </p>
          </div>
        </div>

        <p className="text-center text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6">
          © {new Date().getFullYear()} Azo Incorporadora
        </p>
      </div>
    </div>
  );
}
