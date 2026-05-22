// Proxy seguro para a API do Sienge
// Mantém as credenciais no servidor e nunca as expõe ao cliente

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { z } from 'zod';

// Allowlist de prefixos de path permitidos para o proxy Sienge.
// Bloqueia SSRF: impede que o proxy seja usado para acessar endpoints arbitrários.
const ALLOWED_PATH_PREFIXES = [
  '/sales',
  '/marketing-costs',
  '/developments',
  '/stock',
  '/receivables',
  '/customers',
  '/units',
  '/proposals',
] as const;

const querySchema = z.object({
  path: z
    .string()
    .min(1)
    .startsWith('/')
    .refine(
      (p) => ALLOWED_PATH_PREFIXES.some((prefix) => p.startsWith(prefix)),
      { message: `Path not in allowlist. Permitted prefixes: ${ALLOWED_PATH_PREFIXES.join(', ')}` }
    ),
});

const SIENGE_BASE_URL = 'https://api.sienge.com.br';

export async function GET(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const rateLimitResult = rateLimit(identifier, 60, 60000); // 60 req/min para Sienge

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        },
      }
    );
  }

  const subdomain = process.env.SIENGE_SUBDOMAIN;
  const username = process.env.SIENGE_USERNAME;
  const password = process.env.SIENGE_PASSWORD;

  if (!subdomain || !username || !password) {
    return NextResponse.json(
      { error: 'Sienge not configured. Set SIENGE_SUBDOMAIN, SIENGE_USERNAME and SIENGE_PASSWORD.' },
      { status: 503 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const parsed = querySchema.safeParse({ path: searchParams.get('path') });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid path parameter', details: parsed.error.issues },
      { status: 400 }
    );
  }

  // Forward remaining query params to Sienge (except 'path')
  const forwardParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'path') forwardParams.set(key, value);
  });

  const url = `${SIENGE_BASE_URL}/${subdomain}/api/v1${parsed.data.path}${
    forwardParams.toString() ? `?${forwardParams.toString()}` : ''
  }`;

  const credentials = Buffer.from(`${username}:${password}`).toString('base64');

  try {
    const upstream = await fetch(url, {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      next: { revalidate: 60 }, // Cache de 60s no Next.js
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error(`Sienge upstream error ${upstream.status}: ${text}`);
      return NextResponse.json(
        { error: `Sienge returned ${upstream.status}` },
        { status: upstream.status }
      );
    }

    const data = await upstream.json();
    const response = NextResponse.json(data);
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    return response;
  } catch (error) {
    console.error('Error calling Sienge API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
