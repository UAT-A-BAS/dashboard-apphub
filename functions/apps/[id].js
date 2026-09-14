import { appContentKey, appContentSecurityPolicy } from '../_lib/appHtml.js';

/**
 * Serves an uploaded single-file app. The document is delivered with a sandbox
 * directive so it runs in an opaque origin: it cannot read the AppHub admin
 * cookie, storage, or same-origin APIs, even though it is served from this host.
 */
export async function onRequestGet({ params, env }) {
  if (!env.APPHUB_CONFIG) {
    return new Response('App hosting belum dikonfigurasi.', { status: 500 });
  }

  const id = String(params.id || '').replace(/[^a-z0-9-]/gi, '');
  if (!id) return new Response('Aplikasi tidak ditemukan.', { status: 404 });

  const html = await env.APPHUB_CONFIG.get(appContentKey(id));
  if (html === null) {
    return new Response('Aplikasi tidak ditemukan.', { status: 404 });
  }

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'content-security-policy': appContentSecurityPolicy(),
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      'cache-control': 'no-store',
    },
  });
}
