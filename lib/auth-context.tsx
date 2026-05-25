'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole, UserCreateInput, UserUpdateInput } from '@/lib/types/auth';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isMaster: () => boolean;
  isAdmin: () => boolean;
  isDiretoria: () => boolean;
  createUser: (input: UserCreateInput) => Promise<void>;
  updateUser: (uid: string, input: UserUpdateInput) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Iniciando listener de auth...');
    
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log('AuthProvider: Estado de auth mudou:', fbUser ? `Usuário logado: ${fbUser.email}` : 'Sem usuário');
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        try {
          console.log('AuthProvider: Buscando dados do usuário no Firestore...');
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            console.log('AuthProvider: Dados do usuário encontrados:', userData.role);
            setUser(userData);
          } else {
            console.warn('AuthProvider: Usuário autenticado mas sem registro no Firestore');
            setUser(null);
          }
        } catch (error) {
          console.error('AuthProvider: Erro ao carregar usuário:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    }, (error) => {
      console.error('AuthProvider: Erro no onAuthStateChanged:', error);
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Limpando listener de auth');
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: Tentando login com:', email);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('AuthProvider: Login bem-sucedido:', result.user.email);
    } catch (error) {
      console.error('AuthProvider: Erro no login:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'master') return true;
    
    const permissions: Record<UserRole, string[]> = {
      master: ['*'],
      admin: [
        'dashboard:view', 'financeiro:view', 'marketing:view',
        'lancamentos:view', 'lancamentos:create', 'comercial:view',
        'institucional:view', 'timeline:view',
      ],
      diretoria: ['financeiro:view', 'marketing:view', 'comercial:view'],
    };
    
    return permissions[user.role]?.includes(permission) || false;
  };

  const isMaster = () => user?.role === 'master';
  const isAdmin = () => user?.role === 'admin';
  const isDiretoria = () => user?.role === 'diretoria';

  const createUser = async (input: UserCreateInput) => {
    // Cria usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, input.email, input.password);
    const { uid } = userCredential.user;

    // Atualiza display name
    await updateProfile(userCredential.user, { displayName: input.displayName });

    // Salva no Firestore
    const newUser: User = {
      uid,
      email: input.email,
      displayName: input.displayName,
      role: input.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ativo: true,
    };

    await setDoc(doc(db, 'users', uid), newUser);
  };

  const updateUser = async (uid: string, input: UserUpdateInput) => {
    const updates: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };
    
    if (input.displayName !== undefined) updates.displayName = input.displayName;
    if (input.role !== undefined) updates.role = input.role;
    if (input.ativo !== undefined) updates.ativo = input.ativo;

    await updateDoc(doc(db, 'users', uid), updates);
  };

  const getAllUsers = async (): Promise<User[]> => {
    // Importa getDocs e collection dinamicamente para evitar problemas SSR
    const { getDocs, collection } = await import('firebase/firestore');
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => doc.data() as User);
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signIn,
    signOut,
    hasPermission,
    isMaster,
    isAdmin,
    isDiretoria,
    createUser,
    updateUser,
    getAllUsers,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
