'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function TestFirebasePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('');
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      setResult(`✅ Login bem-sucedido!\nUID: ${user.user.uid}\nEmail: ${user.user.email}`);
    } catch (error: any) {
      setResult(`❌ Erro no login:\nCódigo: ${error.code}\nMensagem: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreate = async () => {
    setLoading(true);
    setResult('');
    try {
      const user = await createUserWithEmailAndPassword(auth, email, password);
      setResult(`✅ Usuário criado!\nUID: ${user.user.uid}\nEmail: ${user.user.email}`);
    } catch (error: any) {
      setResult(`❌ Erro ao criar:\nCódigo: ${error.code}\nMensagem: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-6">Teste de Conexão Firebase Auth</h1>

      <div className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md"
            placeholder="teste@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md"
            placeholder="******"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={testLogin}
            disabled={loading || !email || !password}
            className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar Login'}
          </button>
          <button
            onClick={testCreate}
            disabled={loading || !email || !password}
            className="flex-1 border border-border px-4 py-2 rounded-lg hover:bg-muted disabled:opacity-50"
          >
            Criar Usuário
          </button>
        </div>

        {result && (
          <div className="bg-card border border-border rounded-lg p-4 mt-4">
            <pre className="whitespace-pre-wrap text-sm font-mono">{result}</pre>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-amber-800 mb-2">Instruções:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-amber-700">
            <li>Primeiro, verifique se as variáveis estão configuradas em <a href="/debug" className="underline">/debug</a></li>
            <li>Use este formulário para testar se o Firebase Auth está respondendo</li>
            <li>Se der erro de API Key, configure as env vars corretamente</li>
            <li>Se der erro de "user-not-found", crie um usuário primeiro</li>
            <li>Se der erro de "network", verifique sua conexão</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
