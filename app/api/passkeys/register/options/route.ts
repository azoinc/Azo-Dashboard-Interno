import { NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { getAdminDb } from '@/lib/firebase-admin';

const RP_NAME = 'Azo Dashboard';
const RP_ID = process.env.RP_ID || 'localhost';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    const db = getAdminDb();

    // Busca o usuário no Firestore
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    // Busca credenciais existentes do usuário para não duplicar
    const credentialsRef = db.collection('passkeys');
    const credSnapshot = await credentialsRef.where('userId', '==', userId).get();
    
    const existingCredentials = credSnapshot.docs.map(doc => ({
      id: doc.data().credentialID,
      type: 'public-key' as const,
      transports: doc.data().transports || [],
    }));

    // Gera opções de registro
    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: Buffer.from(userId), // Converte para Uint8Array
      userName: userData.email,
      userDisplayName: userData.displayName || userData.email,
      attestationType: 'none', // Simplificado
      excludeCredentials: existingCredentials,
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
        authenticatorAttachment: undefined,
      },
    });

    // Armazena o challenge temporariamente
    const challengeRef = db.collection('challenges').doc(userId);
    await challengeRef.set({
      challenge: options.challenge,
      email,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error('Erro ao gerar opções de registro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao gerar opções' },
      { status: 500 }
    );
  }
}
