import crypto from 'crypto';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

const SESSION_SECRET = process.env.SESSION_SECRET || 'assam-jobs-alert-secret-key-2024-dev';
const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Hash a password with a random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored salt:hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

/**
 * Create a session token for an admin user
 */
export function createSession(admin: { id: string; email: string }): string {
  const timestamp = Date.now().toString();
  const payload = `${admin.id}:${admin.email}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}:${hmac}`;
}

/**
 * Verify a session token and return the admin ID
 */
export function verifySession(token: string): { adminId: string; email: string; timestamp: number } | null {
  try {
    const parts = token.split(':');
    // Format: adminId:email:timestamp:hmac
    // adminId is a cuid (starts with 'cl' and has no colons), email has @, timestamp is number, hmac is hex
    // We need to handle email which might contain colons... actually emails don't contain colons
    // But cuids don't contain colons either, so format is: cuid:email:timestamp:hmac
    if (parts.length !== 4) return null;
    
    const [adminId, email, timestampStr, hmac] = parts;
    const timestamp = parseInt(timestampStr, 10);
    
    // Check if session is expired
    if (Date.now() - timestamp > SESSION_DURATION) return null;
    
    // Verify HMAC
    const payload = `${adminId}:${email}:${timestampStr}`;
    const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    
    if (hmac !== expectedHmac) return null;
    
    return { adminId, email, timestamp };
  } catch {
    return null;
  }
}

/**
 * Get admin from request by checking the session cookie
 */
export async function getAdminFromRequest(request: Request): Promise<{ id: string; email: string; name: string; role: string } | null> {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;
    
    const cookies = parseCookies(cookieHeader);
    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) return null;
    
    const session = verifySession(token);
    if (!session) return null;
    
    const admin = await db.admin.findUnique({
      where: { id: session.adminId },
      select: { id: true, email: true, name: true, role: true },
    });
    
    return admin;
  } catch {
    return null;
  }
}

/**
 * Require authentication - returns admin or error response
 */
export async function requireAuth(request: Request): Promise<{ admin: { id: string; email: string; name: string; role: string } | null; error?: Response }> {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return { admin: null, error: Response.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { admin };
}

/**
 * Parse cookie header string into an object
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name && rest.length > 0) {
      cookies[name.trim()] = rest.join('=').trim();
    }
  });
  return cookies;
}

/**
 * Set session cookie on response
 */
export function setSessionCookie(response: Response, token: string): void {
  response.headers.append('Set-Cookie', [
    `${SESSION_COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_DURATION / 1000}`,
  ].join('; '));
}

/**
 * Clear session cookie on response
 */
export function clearSessionCookie(response: Response): void {
  response.headers.append('Set-Cookie', [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ].join('; '));
}

/**
 * Generate a slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

/**
 * Calculate reading time from content
 */
export function calculateReadTime(content: string): number {
  if (!content) return 0;
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
