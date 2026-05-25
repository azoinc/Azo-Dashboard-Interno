'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { usePasskeys } from '@/lib/use-passkeys';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';

interface Passkey {
  id: string;
  deviceName: string;
  createdAt: string;
  lastUsedAt?: string;
}

export default function PerfilPage() {
  const { user, firebaseUser } = useAuth();
  const { isSupported, isRegistering, registerPasskey, error, clearError } = usePasskeys();
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Busca as Passkeys do usuário
  useEffect(() => {
    if (!user?.uid) return;

    const fetchPasskeys = async () => {
      try {
        const passkeysRef = collection(db, 'passkeys');
        const q = query(passkeysRef, where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        
        const keys = snapshot.docs.map(doc => ({
          id: doc.id,
          deviceName: doc.data().deviceName || 'Dispositivo sem nome',
          createdAt: doc.data().createdAt?.toDate?.() 
            ? new Date(doc.data().createdAt.toDate()).toLocaleDateString('pt-BR')
            : new Date(doc.data().createdAt).toLocaleDateString('pt-BR'),
          lastUsedAt: doc.data().lastUsedAt?.toDate?.()
            ? new Date(doc.data().lastUsedAt.toDate()).toLocaleDateString('pt-BR')
            : doc.data().lastUsedAt 
              ? new Date(doc.data().lastUsedAt).toLocaleDateString('pt-BR')
              : undefined,
        }));
        
        setPasskeys(keys);
      } catch (err) {
        console.error('Erro ao buscar passkeys:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPasskeys();
  }, [user?.uid]);

  const handleRegisterPasskey = async () => {
    if (!user?.email) {
      setSuccessMessage('Erro: usuário sem email');
      return;
    }

    clearError();
    setSuccessMessage('');

    const success = await registerPasskey(user.email);
    
    if (success) {
      setSuccessMessage('✅ Passkey registrada com sucesso!');
      // Recarrega a lista
      setLoading(true);
      const passkeysRef = collection(db, 'passkeys');
      const q = query(passkeysRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const keys = snapshot.docs.map(doc => ({
        id: doc.id,
        deviceName: doc.data().deviceName || 'Dispositivo sem nome',
        createdAt: doc.data().createdAt?.toDate?.() 
          ? new Date(doc.data().createdAt.toDate()).toLocaleDateString('pt-BR')
          : new Date(doc.data().createdAt).toLocaleDateString('pt-BR'),
        lastUsedAt: doc.data().lastUsedAt?.toDate?.()
          ? new Date(doc.data().lastUsedAt.toDate()).toLocaleDateString('pt-BR')
          : doc.data().lastUsedAt 
            ? new Date(doc.data().lastUsedAt).toLocaleDateString('pt-BR')
            : undefined,
      }));
      setPasskeys(keys);
      setLoading(false);
    }
  };

  const handleDeletePasskey = async (passkeyId: string) => {
    if (!confirm('Tem certeza que deseja remover esta Passkey?')) return;

    try {
      await deleteDoc(doc(db, 'passkeys', passkeyId));
      setPasskeys(prev => prev.filter(k => k.id !== passkeyId));
      setSuccessMessage('✅ Passkey removida com sucesso');
    } catch (err) {
      console.error('Erro ao deletar passkey:', err);
      setSuccessMessage('❌ Erro ao remover Passkey');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64 sm:h-96">
        <div className="text-muted-foreground text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-1 sm:px-0">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Meu Perfil</h1>

      {/* Informações do usuário */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Informações</h2>
        <div className="space-y-2 sm:space-y-3">
          <div>
            <span className="text-xs sm:text-sm text-muted-foreground">Nome</span>
            <p className="font-medium text-sm sm:text-base">{user.displayName || 'Não definido'}</p>
          </div>
          <div>
            <span className="text-xs sm:text-sm text-muted-foreground">E-mail</span>
            <p className="font-medium text-sm sm:text-base">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">Role</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
              user.role === 'master' ? 'bg-purple-100 text-purple-700' :
              user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {user.role === 'master' && 'Master of Universe'}
              {user.role === 'admin' && 'Administrador'}
              {user.role === 'diretoria' && 'Diretoria'}
            </span>
          </div>
        </div>
      </div>

      {/* Gerenciamento de Passkeys */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base sm:text-lg font-semibold">Minhas Passkeys</h2>
          {isSupported && (
            <button
              onClick={handleRegisterPasskey}
              disabled={isRegistering}
              className="bg-primary text-primary-foreground px-3 sm:px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 text-xs sm:text-sm w-full sm:w-auto"
            >
              {isRegistering ? 'Registrando...' : '+ Nova Passkey'}
            </button>
          )}
        </div>

        {!isSupported && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 mb-4">
            <p className="text-xs sm:text-sm text-amber-800">
              ⚠️ Seu navegador não suporta Passkeys. Atualize seu navegador ou use um dispositivo compatível.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4">
            <p className="text-xs sm:text-sm text-red-800">❌ {error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4">
            <p className="text-xs sm:text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        <div className="space-y-2 sm:space-y-3">
          {loading ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">Carregando...</div>
          ) : passkeys.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <div className="text-3xl sm:text-4xl mb-2">🔐</div>
              <p className="text-muted-foreground text-sm mb-1 sm:mb-2">Você ainda não tem Passkeys registradas</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Adicione uma para fazer login sem senha usando biometria ou chave de segurança.
              </p>
            </div>
          ) : (
            passkeys.map((passkey) => (
              <div
                key={passkey.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-border rounded-lg gap-3"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm sm:text-base shrink-0">
                    🔑
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{passkey.deviceName}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      Criada em {passkey.createdAt}
                      {passkey.lastUsedAt && ` • Usada em ${passkey.lastUsedAt}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePasskey(passkey.id)}
                  className="text-xs sm:text-sm text-red-600 hover:text-red-700 px-2 sm:px-3 py-1 hover:bg-red-50 rounded transition-colors w-full sm:w-auto text-center"
                >
                  Remover
                </button>
              </div>
            ))
          )}
        </div>

        {/* Info sobre Passkeys */}
        <div className="mt-4 sm:mt-6 bg-muted rounded-lg p-3 sm:p-4">
          <h3 className="font-medium text-xs sm:text-sm mb-1 sm:mb-2">ℹ️ Sobre Passkeys</h3>
          <ul className="text-xs sm:text-sm text-muted-foreground space-y-0.5 sm:space-y-1 list-disc list-inside">
            <li>Login seguro sem necessidade de senha</li>
            <li>Usa biometria (digital/face) ou chave de segurança física</li>
            <li>Protegido contra phishing e vazamento de senhas</li>
            <li>Sincronizado com sua conta Google/Apple (se ativado)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
