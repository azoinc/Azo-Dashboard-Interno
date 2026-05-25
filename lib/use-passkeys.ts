'use client';

import { useState, useCallback } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

interface UsePasskeysReturn {
  isSupported: boolean;
  isRegistering: boolean;
  isAuthenticating: boolean;
  error: string | null;
  registerPasskey: (email: string) => Promise<boolean>;
  authenticateWithPasskey: (email?: string) => Promise<{ success: boolean; user?: any }>;
  clearError: () => void;
}

export function usePasskeys(): UsePasskeysReturn {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verifica se o navegador suporta WebAuthn
  const isSupported = typeof window !== 'undefined' && 
    window.PublicKeyCredential !== undefined;

  const clearError = useCallback(() => setError(null), []);

  // Registra uma nova Passkey
  const registerPasskey = useCallback(async (email: string): Promise<boolean> => {
    if (!isSupported) {
      setError('Seu navegador não suporta Passkeys');
      return false;
    }

    setIsRegistering(true);
    setError(null);

    try {
      // 1. Busca as opções do servidor
      const optionsRes = await fetch('/api/passkeys/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!optionsRes.ok) {
        const err = await optionsRes.json();
        throw new Error(err.error || 'Falha ao buscar opções de registro');
      }

      const options = await optionsRes.json();

      // 2. Inicia o registro no navegador (abre modal de biometria/segurança)
      const credential = await startRegistration(options);

      // 3. Envia a credencial para o servidor verificar
      const verifyRes = await fetch('/api/passkeys/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, email }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error || 'Falha ao verificar registro');
      }

      const result = await verifyRes.json();
      
      if (result.success) {
        return true;
      }
      
      throw new Error('Falha ao registrar Passkey');
    } catch (err: any) {
      console.error('Erro no registro de Passkey:', err);
      
      // Erros específicos do WebAuthn
      if (err.name === 'NotAllowedError') {
        setError('Registro cancelado pelo usuário');
      } else if (err.name === 'SecurityError') {
        setError('Erro de segurança - verifique se está em HTTPS ou localhost');
      } else {
        setError(err.message || 'Erro ao registrar Passkey');
      }
      
      return false;
    } finally {
      setIsRegistering(false);
    }
  }, [isSupported]);

  // Autentica com Passkey (login sem senha)
  const authenticateWithPasskey = useCallback(async (email?: string): Promise<{ success: boolean; user?: any }> => {
    if (!isSupported) {
      setError('Seu navegador não suporta Passkeys');
      return { success: false };
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      // 1. Busca as opções de autenticação
      const optionsRes = await fetch('/api/passkeys/authenticate/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }), // email é opcional para "discoverable credentials"
      });

      if (!optionsRes.ok) {
        const err = await optionsRes.json();
        throw new Error(err.error || 'Falha ao buscar opções de autenticação');
      }

      const { options, challengeId } = await optionsRes.json();

      // 2. Inicia a autenticação no navegador (prompt de biometria)
      const credential = await startAuthentication(options);

      // 3. Verifica a autenticação no servidor
      const verifyRes = await fetch('/api/passkeys/authenticate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, challengeId }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error || 'Falha na autenticação');
      }

      const result = await verifyRes.json();
      
      if (result.success) {
        return { success: true, user: result.user };
      }
      
      throw new Error('Falha na autenticação');
    } catch (err: any) {
      console.error('Erro na autenticação com Passkey:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Autenticação cancelada pelo usuário');
      } else if (err.name === 'SecurityError') {
        setError('Erro de segurança - verifique se está em HTTPS ou localhost');
      } else {
        setError(err.message || 'Erro na autenticação com Passkey');
      }
      
      return { success: false };
    } finally {
      setIsAuthenticating(false);
    }
  }, [isSupported]);

  return {
    isSupported,
    isRegistering,
    isAuthenticating,
    error,
    registerPasskey,
    authenticateWithPasskey,
    clearError,
  };
}
