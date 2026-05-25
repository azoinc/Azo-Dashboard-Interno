import { NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { getAdminDb } from '@/lib/firebase-admin';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server';

const RP_ID = process.env.RP_ID || 'localhost';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const db = getAdminDb();
    let allowCredentials: { id: string; type: 'public-key'; transports?: AuthenticatorTransportFuture[] }[] = [];

    // Se tiver email, busca as credenciais específicas do usuário
    if (email) {
      const usersRef = db.collection('users');
      const userSnapshot = await usersRef.where('email', '==', email).get();

      if (!userSnapshot.empty) {
        const userId = userSnapshot.docs[0].id;
        const credentialsRef = db.collection('passkeys');
        const credSnapshot = await credentialsRef.where('userId', '==', userId).get();

        allowCredentials = credSnapshot.docs.map(doc => ({
          id: doc.data().credentialID,
          type: 'public-key' as const,
          transports: (doc.data().transports || []) as AuthenticatorTransportFuture[],
        }));
      }
    }

    // Se não tiver credenciais específicas, permite descoberta (discoverable credentials)
    // Isso permite login sem username usando Resident Keys
    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
      userVerification: 'preferred',
    });

    // Armazena o challenge temporariamente
    const challengeId = crypto.randomUUID();
    await db.collection('authChallenges').doc(challengeId).set({
      challenge: options.challenge,
      email: email || null,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos
    });

    return NextResponse.json({
      options,
      challengeId,
    });
  } catch (error) {
    console.error('Erro ao gerar opções de autenticação:', error);
    return NextResponse.json(
      { error: 'Erro interno ao gerar opções' },
      { status: 500 }
    );
  }
}
