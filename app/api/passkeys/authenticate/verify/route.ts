import { NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { getAdminDb } from '@/lib/firebase-admin';

const RP_ID = process.env.RP_ID || 'localhost';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const authResponse = body.credential;
    const challengeId = body.challengeId;

    if (!authResponse || !challengeId) {
      return NextResponse.json(
        { error: 'Credencial e challengeId são obrigatórios' },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Busca o challenge
    const challengeRef = db.collection('authChallenges').doc(challengeId);
    const challengeDoc = await challengeRef.get();

    if (!challengeDoc.exists) {
      return NextResponse.json(
        { error: 'Challenge não encontrado ou expirado' },
        { status: 400 }
      );
    }

    const challengeData = challengeDoc.data();

    // Verifica se expirou
    if (challengeData?.expiresAt?.toMillis() < Date.now()) {
      return NextResponse.json({ error: 'Challenge expirado' }, { status: 400 });
    }

    // Busca a credencial pelo ID
    const credentialID = authResponse.id;
    const passkeysRef = db.collection('passkeys');
    const passkeySnapshot = await passkeysRef.where('credentialID', '==', credentialID).get();

    if (passkeySnapshot.empty) {
      return NextResponse.json(
        { error: 'Credencial não encontrada' },
        { status: 400 }
      );
    }

    const passkeyDoc = passkeySnapshot.docs[0];
    const passkeyData = passkeyDoc.data();

    // Verifica a autenticação
    const verification = await verifyAuthenticationResponse({
      response: authResponse,
      expectedChallenge: challengeData?.challenge,
      expectedOrigin: process.env.EXPECTED_ORIGIN || `https://${RP_ID}`,
      expectedRPID: RP_ID,
      credential: {
        id: passkeyData.credentialID,
        publicKey: Buffer.from(passkeyData.credentialPublicKey, 'base64url'),
        counter: passkeyData.counter,
        transports: passkeyData.transports || [],
      },
    });

    if (!verification.verified) {
      return NextResponse.json(
        { error: 'Falha na verificação da autenticação' },
        { status: 400 }
      );
    }

    // Atualiza o contador anti-replay
    await passkeyDoc.ref.update({
      counter: verification.authenticationInfo.newCounter,
      lastUsedAt: new Date(),
    });

    // Limpa o challenge
    await challengeRef.delete();

    // Retorna os dados do usuário para login
    const userDoc = await db.collection('users').doc(passkeyData.userId).get();
    const userData = userDoc.data();

    return NextResponse.json({
      success: true,
      user: {
        uid: passkeyData.userId,
        email: passkeyData.userEmail,
        displayName: userData?.displayName || passkeyData.userName,
        role: userData?.role,
      },
      credentialID: passkeyData.credentialID,
    });
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return NextResponse.json(
      { error: 'Erro interno ao verificar autenticação' },
      { status: 500 }
    );
  }
}
