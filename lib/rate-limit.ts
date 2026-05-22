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

// Helper to get client identifier from request
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  const ip = forwarded?.split(',')[0]?.trim() || 
             realIp || 
             cfConnectingIp || 
             'unknown';
  
  // Add user agent to differentiate different browsers from same IP
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return `${ip}-${userAgent}`;
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
