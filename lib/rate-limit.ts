// Simple in-memory rate limiting for API routes
// For production, consider using Redis or a dedicated rate limiting service

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitStore>();

export function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000 // 1 minute default
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Clean up expired entries
  if (record && record.resetTime < now) {
    rateLimitStore.delete(identifier);
  }

  const currentRecord = rateLimitStore.get(identifier);

  if (!currentRecord) {
    // First request or expired
    const newRecord: RateLimitStore = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(identifier, newRecord);
    return {
      success: true,
      remaining: limit - 1,
      resetTime: newRecord.resetTime,
    };
  }

  if (currentRecord.count >= limit) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetTime: currentRecord.resetTime,
    };
  }

  // Increment count
  currentRecord.count++;
  return {
    success: true,
    remaining: limit - currentRecord.count,
    resetTime: currentRecord.resetTime,
  };
}

// Helper to get client identifier from request.
// Ordem de confiança:
//   1. cf-connecting-ip  — definido pela Cloudflare, não pode ser falsificado pelo cliente
//   2. x-real-ip         — definido pelo nginx/proxy reverso confiável
//   3. x-forwarded-for   — ÚLTIMO recurso: facilmente forjado por clientes; usamos apenas
//                          o ÚLTIMO IP da cadeia (o mais próximo do proxy de borda real)
// Em produção sem proxy reverso, nenhum desses headers estará presente → 'unknown'.
// Não incluímos user-agent no identificador para evitar que clientes mudem de UA para burlar o limite.
export function getClientIdentifier(request: Request): string {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  // x-forwarded-for pode ter múltiplos IPs: "client, proxy1, proxy2"
  // Usar o ÚLTIMO da lista reduz risco de IP spoofing via header forjado pelo cliente
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',');
    return parts[parts.length - 1].trim();
  }

  return 'unknown';
}

// Clean up old entries periodically (call this from a cron job or similar)
export function cleanupRateLimitStore() {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  rateLimitStore.forEach((record, key) => {
    if (record.resetTime < now) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
