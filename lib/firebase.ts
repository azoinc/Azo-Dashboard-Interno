import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Verifica se todas as variáveis estão configuradas
const missingVars = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0 && typeof window !== 'undefined') {
  console.error('Firebase: Variáveis de ambiente faltando:', missingVars);
}

let app;
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  if (typeof window !== 'undefined') {
    console.log('Firebase: App inicializado com sucesso');
  }
} catch (error) {
  console.error('Firebase: Erro ao inicializar app:', error);
  throw error;
}

// Suporta database customizado (padrão é "(default)")
const databaseId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || '(default)';

export const auth = getAuth(app);
export const db = getFirestore(app, databaseId);

// Log para debug (apenas no client)
if (typeof window !== 'undefined') {
  console.log('Firebase Auth:', auth ? 'OK' : 'FALHOU');
  console.log('Firebase Firestore:', db ? 'OK' : 'FALHOU', '- Database:', databaseId);
}

export default app;
