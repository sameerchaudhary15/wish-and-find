// Admin sign-in. The password is never stored in this code or in the repository.
// It is read from the host's environment settings:
//   ADMIN_PASSWORD        the admin password (simplest), or
//   ADMIN_PASSWORD_HASH   "salt:hash" from scripts/hash-password.mjs (stronger)
//   SESSION_SECRET        optional; a long random string for signing sessions
import { createHash, createHmac, scryptSync, timingSafeEqual } from 'node:crypto';

const SESSION_HOURS = 8;
const COOKIE = 'wf_session';
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const failures = new Map(); // ip -> [timestamps]; per server instance

const sha = (s) => createHash('sha256').update(String(s)).digest();

export function isConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD);
}

export function passwordMatches(input) {
  const given = String(input ?? '');
  try {
    if (process.env.ADMIN_PASSWORD_HASH) {
      const [salt, hash] = process.env.ADMIN_PASSWORD_HASH.split(':');
      const want = Buffer.from(hash, 'hex');
      const got = scryptSync(given, Buffer.from(salt, 'hex'), want.length);
      return timingSafeEqual(got, want);
    }
    if (process.env.ADMIN_PASSWORD) {
      return timingSafeEqual(sha(given), sha(process.env.ADMIN_PASSWORD));
    }
  } catch { /* malformed setting: treat as no match */ }
  return false;
}

function signingKey() {
  return process.env.SESSION_SECRET
    || sha('wf-session:' + (process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || '')).toString('hex');
}
const sign = (value) => createHmac('sha256', signingKey()).update(value).digest('hex');

export function sessionCookie() {
  const expires = String(Date.now() + SESSION_HOURS * 3600 * 1000);
  return `${COOKIE}=${expires}.${sign(expires)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_HOURS * 3600}`;
}
export function clearCookie() {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export function isSignedIn(request) {
  if (!isConfigured()) return false;
  const raw = (request.headers.get('cookie') || '').split(/;\s*/).find((c) => c.startsWith(COOKIE + '='));
  if (!raw) return false;
  const [expires, mac] = raw.slice(COOKIE.length + 1).split('.');
  if (!expires || !mac || !/^\d+$/.test(expires) || Number(expires) < Date.now()) return false;
  const want = Buffer.from(sign(expires));
  const got = Buffer.from(mac);
  return got.length === want.length && timingSafeEqual(got, want);
}

export function clientIp(request) {
  return (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
}
export function isLockedOut(ip) {
  const recent = (failures.get(ip) || []).filter((t) => t > Date.now() - WINDOW_MS);
  failures.set(ip, recent);
  return recent.length >= MAX_FAILURES;
}
export function recordFailure(ip) {
  failures.set(ip, [...(failures.get(ip) || []), Date.now()]);
}
export function clearFailures(ip) { failures.delete(ip); }

// Writes must come from this site's own pages.
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try { return new URL(origin).host === (request.headers.get('x-forwarded-host') || request.headers.get('host')); }
  catch { return false; }
}
