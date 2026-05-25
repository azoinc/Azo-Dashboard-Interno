// Tipos para WebAuthn / Passkeys (FIDO2)

export interface PasskeyCredential {
  id: string;
  credentialID: string;
  credentialPublicKey: string;
  counter: number;
  transports: AuthenticatorTransportFuture[];
  userId: string;
  userEmail: string;
  userName: string;
  deviceName: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface RegistrationOptions {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    alg: number;
    type: 'public-key';
  }>;
  timeout?: number;
  attestation?: AttestationConveyancePreference;
  excludeCredentials?: PublicKeyCredentialDescriptorJSON[];
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  extensions?: AuthenticationExtensionsClientInputs;
}

export interface AuthenticationOptions {
  challenge: string;
  timeout?: number;
  rpId?: string;
  allowCredentials?: PublicKeyCredentialDescriptorJSON[];
  userVerification?: UserVerificationRequirement;
  extensions?: AuthenticationExtensionsClientInputs;
}

// Tipos auxiliares para compatibilidade com WebAuthn
export type AuthenticatorTransportFuture = 
  | 'ble'
  | 'hybrid'
  | 'internal'
  | 'nfc'
  | 'smart-card'
  | 'usb';

export interface PublicKeyCredentialDescriptorJSON {
  id: string;
  type: 'public-key';
  transports?: AuthenticatorTransportFuture[];
}

type AttestationConveyancePreference = 'none' | 'indirect' | 'direct';

interface AuthenticatorSelectionCriteria {
  authenticatorAttachment?: 'platform' | 'cross-platform';
  requireResidentKey?: boolean;
  residentKey?: 'discouraged' | 'preferred' | 'required';
  userVerification?: UserVerificationRequirement;
}

type UserVerificationRequirement = 'discouraged' | 'preferred' | 'required';

// Resposta de registro do cliente
export interface RegistrationCredentialJSON {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
    authenticatorData?: string;
    transports: AuthenticatorTransportFuture[];
    publicKeyAlgorithm?: number;
    publicKey?: string;
  };
  type: 'public-key';
  clientExtensionResults?: AuthenticationExtensionsClientOutputs;
  authenticatorAttachment?: 'platform' | 'cross-platform';
}

// Resposta de autenticação do cliente
export interface AuthenticationCredentialJSON {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle?: string;
  };
  type: 'public-key';
  clientExtensionResults?: AuthenticationExtensionsClientOutputs;
  authenticatorAttachment?: 'platform' | 'cross-platform';
}

interface AuthenticationExtensionsClientInputs {
  credProps?: boolean;
  largeBlob?: {
    support?: 'required' | 'preferred';
    read?: boolean;
    write?: string;
  };
}

interface AuthenticationExtensionsClientOutputs {
  credProps?: {
    rk?: boolean;
    authenticatorDisplayName?: string;
  };
  largeBlob?: {
    supported?: boolean;
    blob?: string;
    written?: boolean;
  };
}
