// Shared helpers for hosting uploaded single-file HTML apps. Files and
// directories under functions/ that start with "_" are not routed by
// Cloudflare Pages, so this module is import-only.

// This is Cloudflare KV's hard limit for a single value, not an AppHub choice.
// Measured in bytes of the UTF-8 encoded file. Uploads larger than this cannot
// be stored at all, so the limit is surfaced to the admin instead of failing late.
export const MAX_APP_BYTES = 25 * 1024 * 1024;

export const APP_INDEX_KEY = 'apps:index';

export function appContentKey(id) {
  return `apps:item:${id}`;
}

export function normalizeAppName(value) {
  return String(value ?? '').trim().slice(0, 60);
}

/**
 * Turn a display name into a URL-safe slug. Returns an empty string when the
 * name has no usable characters, so the caller can fall back to a random id.
 */
export function slugifyName(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function utf8ByteLength(value) {
  return new TextEncoder().encode(String(value ?? '')).byteLength;
}

export function isLikelyHtml(value) {
  const head = String(value ?? '').slice(0, 4000).toLowerCase();
  return head.includes('<html') || head.includes('<!doctype') || head.includes('<body') || head.includes('<script');
}

export function appByteLimitMessage(bytes) {
  return `File terlalu besar (${formatBytes(bytes)}). Batas penyimpanan Cloudflare ${formatBytes(MAX_APP_BYTES)} per file.`;
}

export function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Pick a slug that is not already taken. Falls back to a random id when the
 * name slugifies to nothing or every numbered variant is taken.
 */
export function uniqueAppId(name, takenIds, randomId = () => crypto.randomUUID().slice(0, 8)) {
  const taken = new Set(takenIds);
  const base = slugifyName(name);
  if (!base) return randomId();
  if (!taken.has(base)) return base;
  for (let suffix = 2; suffix <= 50; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
  return randomId();
}
