import { readSessionCookie, verifySessionToken } from './_auth.js';
import {
  APP_INDEX_KEY,
  appByteLimitMessage,
  appContentKey,
  isLikelyHtml,
  MAX_APP_BYTES,
  normalizeAppName,
  uniqueAppId,
  utf8ByteLength,
} from '../../_lib/appHtml.js';

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

async function readIndex(env) {
  const raw = await env.APPHUB_CONFIG.get(APP_INDEX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeIndex(env, entries) {
  await env.APPHUB_CONFIG.put(APP_INDEX_KEY, JSON.stringify(entries));
}

/**
 * Shared validation for uploads and replacements, so a swapped-in file is held
 * to exactly the same rules as a brand new one.
 */
function readAppFile(body) {
  const html = typeof body?.html === 'string' ? body.html : '';
  if (!html.trim()) return { error: 'File HTML kosong.', status: 400 };
  if (!isLikelyHtml(html)) return { error: 'File itu tidak terlihat seperti HTML.', status: 400 };

  const bytes = utf8ByteLength(html);
  if (bytes > MAX_APP_BYTES) return { error: appByteLimitMessage(bytes), status: 413 };

  return { html, bytes };
}

export async function onRequestGet({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;
  if (!env.APPHUB_CONFIG) {
    return noStore({ message: 'KV binding APPHUB_CONFIG belum dikonfigurasi.' }, { status: 500 });
  }
  const apps = await readIndex(env);
  return noStore({ apps, maxBytes: MAX_APP_BYTES });
}

export async function onRequestPost({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;
  if (!env.APPHUB_CONFIG) {
    return noStore({ message: 'KV binding APPHUB_CONFIG belum dikonfigurasi.' }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return noStore({ message: 'Payload tidak valid.' }, { status: 400 });
  }

  const name = normalizeAppName(body?.name);
  if (!name) return noStore({ message: 'Nama aplikasi wajib diisi.' }, { status: 400 });

  const file = readAppFile(body);
  if (file.error) return noStore({ message: file.error }, { status: file.status });
  const { html, bytes } = file;

  const apps = await readIndex(env);
  const id = uniqueAppId(name, apps.map((app) => app.id));
  if (apps.length >= 50) {
    return noStore({ message: 'Maksimum 50 aplikasi tersimpan. Hapus salah satu dulu.' }, { status: 400 });
  }

  await env.APPHUB_CONFIG.put(appContentKey(id), html);
  const entry = {
    id,
    name,
    bytes,
    uploadedAt: new Date().toISOString(),
  };
  await writeIndex(env, [...apps, entry]);

  return noStore({ app: entry, url: `/apps/${id}/`, maxBytes: MAX_APP_BYTES });
}

/**
 * Replace the bytes of an app that already exists, keeping its id and therefore
 * its URL. Cards, bookmarks and shared links keep working, and every visitor's
 * local copy is invalidated by the new uploadedAt stamp.
 */
export async function onRequestPut({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;
  if (!env.APPHUB_CONFIG) {
    return noStore({ message: 'KV binding APPHUB_CONFIG belum dikonfigurasi.' }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return noStore({ message: 'Payload tidak valid.' }, { status: 400 });
  }

  const id = String(body?.id ?? '').trim();
  if (!id) return noStore({ message: 'ID aplikasi wajib diisi.' }, { status: 400 });

  const apps = await readIndex(env);
  const index = apps.findIndex((app) => app.id === id);
  if (index === -1) {
    return noStore({ message: 'Aplikasi tidak ditemukan. Ganti file hanya berlaku untuk aplikasi yang sudah tersimpan.' }, { status: 404 });
  }

  const file = readAppFile(body);
  if (file.error) return noStore({ message: file.error }, { status: file.status });
  const { html, bytes } = file;

  const previous = apps[index];
  // A blank name means "keep the current one", so the field stays optional.
  const name = normalizeAppName(body?.name) || previous.name;

  await env.APPHUB_CONFIG.put(appContentKey(id), html);
  const entry = {
    ...previous,
    name,
    bytes,
    uploadedAt: new Date().toISOString(),
  };
  const next = [...apps];
  next[index] = entry;
  await writeIndex(env, next);

  return noStore({ app: entry, url: `/apps/${id}/`, maxBytes: MAX_APP_BYTES, replaced: true });
}

export async function onRequestDelete({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;
  if (!env.APPHUB_CONFIG) {
    return noStore({ message: 'KV binding APPHUB_CONFIG belum dikonfigurasi.' }, { status: 500 });
  }

  const id = new URL(request.url).searchParams.get('id') || '';
  const apps = await readIndex(env);
  if (!apps.some((app) => app.id === id)) {
    return noStore({ message: 'Aplikasi tidak ditemukan.' }, { status: 404 });
  }

  await env.APPHUB_CONFIG.delete(appContentKey(id));
  await writeIndex(
    env,
    apps.filter((app) => app.id !== id),
  );
  return noStore({ deleted: id });
}
