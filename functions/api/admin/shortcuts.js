import { readSessionCookie, verifySessionToken } from './_auth.js';

const SHORTCUTS_KEY = 'shortcuts';
const MAX_SHORTCUTS = 50;
const MAX_PAYLOAD_BYTES = 900_000;

function noStore(payload, init = {}) {
  return Response.json(payload, {
    ...init,
    headers: {
      'cache-control': 'no-store',
      ...(init.headers || {}),
    },
  });
}

async function requireAdmin(request, env) {
  const authenticated = await verifySessionToken(env, readSessionCookie(request));
  if (!authenticated) {
    return noStore({ message: 'Session admin tidak valid.' }, { status: 401 });
  }
  return null;
}

function validateShortcuts(shortcuts) {
  if (!Array.isArray(shortcuts)) return 'Payload shortcuts harus berupa array.';
  if (shortcuts.length < 1 || shortcuts.length > MAX_SHORTCUTS) return `Jumlah aplikasi harus 1-${MAX_SHORTCUTS}.`;
  const invalid = shortcuts.find((item) => {
    return (
      !item ||
      typeof item !== 'object' ||
      typeof item.name !== 'string' ||
      typeof item.url !== 'string' ||
      !item.name.trim() ||
      !item.url.trim()
    );
  });
  return invalid ? 'Setiap aplikasi wajib punya nama dan URL.' : '';
}

function validateCategories(categories) {
  if (!Array.isArray(categories)) return 'Payload categories harus berupa array.';
  if (categories.length < 1 || categories.length > 30) return 'Jumlah kategori harus 1-30.';
  const invalid = categories.find((item) => !item || typeof item !== 'object' || typeof item.id !== 'string' || typeof item.name !== 'string' || !item.name.trim());
  return invalid ? 'Setiap kategori wajib punya id dan nama.' : '';
}

export async function onRequestGet({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;
  if (!env.APPHUB_CONFIG) {
    return noStore({ message: 'KV binding APPHUB_CONFIG belum dikonfigurasi.' }, { status: 500 });
  }

  const raw = await env.APPHUB_CONFIG.get(SHORTCUTS_KEY);
  if (!raw) return noStore({ shortcuts: null });
  const payload = JSON.parse(raw);
  return noStore({
    shortcuts: Array.isArray(payload.shortcuts) ? payload.shortcuts : null,
    categories: Array.isArray(payload.categories) ? payload.categories : null,
    updatedAt: payload.updatedAt || null,
  });
}

export async function onRequestPut({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;
  if (!env.APPHUB_CONFIG) {
    return noStore({ message: 'KV binding APPHUB_CONFIG belum dikonfigurasi.' }, { status: 500 });
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_PAYLOAD_BYTES) {
    return noStore({ message: 'Payload terlalu besar. Kurangi ukuran icon upload.' }, { status: 413 });
  }

  const body = JSON.parse(text || '{}');
  const message = validateShortcuts(body.shortcuts);
  if (message) return noStore({ message }, { status: 400 });
  const categoryMessage = validateCategories(body.categories);
  if (categoryMessage) return noStore({ message: categoryMessage }, { status: 400 });

  const payload = {
    shortcuts: body.shortcuts,
    categories: body.categories,
    updatedAt: new Date().toISOString(),
  };
  await env.APPHUB_CONFIG.put(SHORTCUTS_KEY, JSON.stringify(payload));
  return noStore(payload);
}
