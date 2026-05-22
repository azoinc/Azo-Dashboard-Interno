import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

const investmentQuerySchema = z.object({
  empreendimento: z.string().optional().default('all'),
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.string().transform((val) => parseInt(val || '1')).pipe(z.number().int().positive()).optional().default(1),
  limit: z.string().transform((val) => parseInt(val || '50')).pipe(z.number().int().positive().max(100)).optional().default(50),
});

export async function GET(request: NextRequest) {
  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimitResult = rateLimit(identifier, 100, 60000); // 100 requests per minute
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        }
      }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validatedParams = investmentQuerySchema.safeParse(queryParams);
    
    if (!validatedParams.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validatedParams.error.issues },
        { status: 400 }
      );
    }

    const { empreendimento, data_inicio, data_fim, page, limit } = validatedParams.data;

    const adminDb = getAdminDb();
    let baseQuery: FirebaseFirestore.Query = adminDb.collection('investimento');

    if (empreendimento !== 'all') {
      baseQuery = baseQuery.where('empreendimento', '==', empreendimento);
    }
    if (data_inicio && data_fim) {
      baseQuery = baseQuery
        .where('mes_ref', '>=', data_inicio)
        .where('mes_ref', '<=', data_fim);
    }

    const [totalSnap, snapshot] = await Promise.all([
      baseQuery.count().get(),
      baseQuery.orderBy('mes_ref', 'desc').limit(limit).offset((page - 1) * limit).get(),
    ]);

    const total = totalSnap.data().count;
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const response = NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

    return response;
  } catch (error) {
    console.error('Error fetching investment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
