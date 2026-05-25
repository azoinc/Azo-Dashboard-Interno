'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { User, UserRole } from '@/lib/types/auth';

export default function AdminPage() {
  const { isMaster, loading, getAllUsers, createUser, updateUser } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!loading && !isMaster()) {
      router.push('/dashboard');
    }
    if (isMaster()) {
      loadUsers();
    }
  }, [isMaster, loading, router]);

  const loadUsers = async () => {
    const allUsers = await getAllUsers();
    setUsers(allUsers);
  };

  if (loading) return <div className="flex items-center justify-center h-96">Carregando...</div>;
  if (!isMaster()) return <div className="flex items-center justify-center h-96">Acesso negado</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Administração</h1>
          <p className="text-muted-foreground">Gerenciamento de usuários e permissões</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">
          + Novo Usuário
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-sm">Nome</th>
              <th className="text-left py-3 px-4 font-medium text-sm">E-mail</th>
              <th className="text-left py-3 px-4 font-medium text-sm">Role</th>
              <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
              <th className="text-left py-3 px-4 font-medium text-sm">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.uid} className="border-b border-border/50">
                <td className="py-3 px-4">{user.displayName || '-'}</td>
                <td className="py-3 px-4 text-sm">{user.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'master' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {user.role === 'master' && 'Master of Universe'}
                    {user.role === 'admin' && 'Administrador'}
                    {user.role === 'diretoria' && 'Diretoria'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`w-2 h-2 rounded-full inline-block mr-2 ${user.ativo ? 'bg-green-500' : 'bg-red-500'}`} />
                  {user.ativo ? 'Ativo' : 'Inativo'}
                </td>
                <td className="py-3 px-4">
                  <button className="text-sm text-primary hover:underline">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && <NovoUsuarioModal onClose={() => setShowModal(false)} onSave={loadUsers} />}
    </div>
  );
}

function NovoUsuarioModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const { createUser } = useAuth();
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    role: 'admin' as UserRole,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createUser(form);
      onSave();
      onClose();
    } catch (err) {
      alert('Erro ao criar usuário');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Novo Usuário</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="admin">Administrador</option>
              <option value="diretoria">Diretoria</option>
              <option value="master">Master of Universe</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Criando...' : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
