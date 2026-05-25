'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [config, setConfig] = useState<Record<string, string | undefined>>({});
  const [missing, setMissing] = useState<string[]>([]);

  useEffect(() => {
    // Verifica quais variáveis estão disponíveis no client
    const firebaseVars = {
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    setConfig(firebaseVars);
    setMissing(Object.entries(firebaseVars)
      .filter(([_, value]) => !value || value.includes('your-'))
      .map(([key]) => key));
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-6">Debug - Configuração Firebase</h1>

      <div className="max-w-3xl space-y-6">
        {/* Status */}
        <div className={`p-4 rounded-lg ${missing.length === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <p className="font-semibold">
            {missing.length === 0 ? '✅ Todas as variáveis configuradas!' : `❌ ${missing.length} variáveis faltando ou inválidas`}
          </p>
        </div>

        {/* Lista de variáveis */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Variável</th>
                <th className="text-left py-3 px-4 font-medium">Valor</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(config).map(([key, value]) => {
                const isMissing = !value || value.includes('your-');
                const displayValue = isMissing ? '❌ NÃO CONFIGURADO' : value?.substring(0, 20) + '...';
                
                return (
                  <tr key={key} className="border-b border-border/50">
                    <td className="py-3 px-4 font-mono text-sm">{key}</td>
                    <td className="py-3 px-4 text-sm">{displayValue}</td>
                    <td className="py-3 px-4">
                      {isMissing ? (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Faltando</span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">OK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Instruções */}
        {missing.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2">Como corrigir:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-amber-700">
              <li>Abra o arquivo <code className="bg-amber-100 px-1 rounded">.env.local</code> na raiz do projeto</li>
              <li>Preencha todas as variáveis NEXT_PUBLIC_FIREBASE_* com os valores do seu projeto Firebase</li>
              <li>Para obter esses valores, vá em: Firebase Console → Configurações do Projeto → Seus aplicativos</li>
              <li>Após editar, <strong>reinicie o servidor Next.js</strong> (pare e rode npm run dev novamente)</li>
            </ol>
          </div>
        )}

        {/* Links úteis */}
        <div className="space-y-2">
          <a href="/login" className="text-primary hover:underline block">→ Ir para Login</a>
          <a href="/dashboard" className="text-primary hover:underline block">→ Ir para Dashboard</a>
        </div>
      </div>
    </div>
  );
}
