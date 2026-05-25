import { NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { getAdminDb } from '@/lib/firebase-admin';

const RP_ID = process.env.RP_ID || 'localhost';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const regResponse = body.credential;
    const email = body.email;

    if (!regResponse || !email) {
      return NextResponse.json(
        { error: 'Credencial e email são obrigatórios' },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Busca o usuário
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('email', '==', email).get();

    if (userSnapshot.empty) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;

    // Busca o challenge temporário
    const challengeRef = db.collection('challenges').doc(userId);
    const challengeDoc = await challengeRef.get();

    if (!challengeDoc.exists) {
      return NextResponse.json(
        { error: 'Challenge expirado ou não encontrado' },
        { status: 400 }
      );
    }

    const challengeData = challengeDoc.data();
    
    // Verifica se o challenge expirou
    if (challengeData?.expiresAt?.toMillis() < Date.now()) {
      return NextResponse.json({ error: 'Challenge expirado' }, { status: 400 });
    }

    // Verifica a credencial
    const verification = await verifyRegistrationResponse({
      response: regResponse,
      expectedChallenge: challengeData?.challenge,
      expectedOrigin: process.env.EXPECTED_ORIGIN || `https://${RP_ID}`,
      expectedRPID: RP_ID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: 'Falha na verificação da credencial' },
        { status: 400 }
      );
    }

    // Acessa os dados da credencial da nova API
    const webAuthnCredential = verification.registrationInfo.credential;
    const credentialID = webAuthnCredential.id;
    const credentialPublicKey = webAuthnCredential.publicKey;
    const counter = webAuthnCredential.counter;

    // Salva a credencial no Firestore
    const passkeyData = {
      credentialID: credentialID,
      credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64url'),
      counter,
      transports: regResponse.response.transports || [],
      userId,
      userEmail: email,
      userName: userDoc.data().displayName || email,
      deviceName: regResponse.authenticatorAttachment === 'platform' ? 
                  'Biometria do dispositivo' : 'Chave de segurança',
      createdAt: new Date(),
    };

    await db.collection('passkeys').add(passkeyData);

    // Limpa o challenge
    await challengeRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Passkey registrada com sucesso',
      credentialID: passkeyData.credentialID,
    });
  } catch (error) {
    console.error('Erro ao verificar registro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao verificar registro' },
      { status: 500 }
    );
  }
}
