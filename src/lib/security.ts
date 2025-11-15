/**
 * Input Sanitization and Validation Utilities
 * 
 * Provides functions to sanitize and validate user inputs
 * to prevent XSS, SQL injection, and other security vulnerabilities.
 */

/**
 * Remove HTML tags and dangerous characters from string
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove remaining angle brackets
    .trim();
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  const sanitized = email.toLowerCase().trim();
  
  // Basic email validation regex
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  
  return emailRegex.test(sanitized) ? sanitized : '';
}

/**
 * Sanitize phone number (Indian format)
 */
export function sanitizePhoneNumber(phone: string): string {
  if (typeof phone !== 'string') return '';
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Indian phone numbers should be 10 digits
  if (digitsOnly.length === 10 && digitsOnly[0] !== '0') {
    return digitsOnly;
  }
  
  // Handle phone numbers with country code
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return digitsOnly.slice(2);
  }
  
  return '';
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: string | number, options?: {
  min?: number;
  max?: number;
  decimals?: number;
}): number {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (isNaN(num) || !isFinite(num)) {
    return 0;
  }
  
  let sanitized = num;
  
  if (options?.min !== undefined) {
    sanitized = Math.max(sanitized, options.min);
  }
  
  if (options?.max !== undefined) {
    sanitized = Math.min(sanitized, options.max);
  }
  
  if (options?.decimals !== undefined) {
    sanitized = parseFloat(sanitized.toFixed(options.decimals));
  }
  
  return sanitized;
}

/**
 * Sanitize property ID (alphanumeric with dashes/underscores)
 */
export function sanitizePropertyId(id: string): string {
  if (typeof id !== 'string') return '';
  
  return id
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .trim()
    .toUpperCase();
}

/**
 * Sanitize address
 */
export function sanitizeAddress(address: string): string {
  if (typeof address !== 'string') return '';
  
  return address
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 500); // Limit length
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') return '';
  
  return query
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 100); // Limit search query length
}

/**
 * Validate and sanitize date string
 */
export function sanitizeDate(dateStr: string): string | null {
  if (typeof dateStr !== 'string') return null;
  
  const date = new Date(dateStr);
  
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return date.toISOString().split('T')[0];
}

/**
 * Sanitize remarks/notes (allow some special characters)
 */
export function sanitizeRemarks(text: string, maxLength: number = 1000): string {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize object properties recursively
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  schema: Partial<Record<keyof T, 'string' | 'email' | 'phone' | 'number' | 'address' | 'date'>>
): Partial<T> {
  const sanitized: any = {};
  
  for (const [key, type] of Object.entries(schema)) {
    const value = obj[key];
    
    switch (type) {
      case 'string':
        sanitized[key] = sanitizeString(value);
        break;
      case 'email':
        sanitized[key] = sanitizeEmail(value);
        break;
      case 'phone':
        sanitized[key] = sanitizePhoneNumber(value);
        break;
      case 'number':
        sanitized[key] = sanitizeNumber(value);
        break;
      case 'address':
        sanitized[key] = sanitizeAddress(value);
        break;
      case 'date':
        sanitized[key] = sanitizeDate(value);
        break;
      default:
        sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Rate limiting helper (simple in-memory implementation)
 * For production, use Redis or similar distributed cache
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 900000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
}

// Clean up rate limit store periodically
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000); // Clean up every minute
}
