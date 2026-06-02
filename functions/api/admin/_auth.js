const COOKIE_NAME = 'admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 2;

function textEncoder() {
  return new TextEncoder();
}

function toBase64Url(bytes) {
  const raw = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(raw).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function fromBase64Url(value) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const raw = atob(normalized);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', textEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

function getSecret(env) {
  return env.ADMIN_SESSION_SECRET || env.ADMIN_PIN || env.ADMIN_PASSWORD || '';
}

export function getAdminPassword(env) {
  return env.ADMIN_PIN || env.ADMIN_PASSWORD || '';
}

export async function createSessionToken(env) {
  const secret = getSecret(env);
  const payload = toBase64Url(
    textEncoder().encode(
      JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
        nonce: crypto.randomUUID(),
      }),
    ),
  );
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(secret), textEncoder().encode(payload));
  return `${payload}.${toBase64Url(signature)}`;
}

export async function verifySessionToken(env, token) {
  const secret = getSecret(env);
  if (!secret || !token || !token.includes('.')) return false;
  const [payload, signature] = token.split('.');
  const validSignature = await crypto.subtle.verify('HMAC', await hmacKey(secret), fromBase64Url(signature), textEncoder().encode(payload));
  if (!validSignature) return false;

  try {
    const decoded = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    return typeof decoded.exp === 'number' && decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function readSessionCookie(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : '';
}

export function sessionCookie(request, token) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${MAX_AGE_SECONDS}${secure}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
}
