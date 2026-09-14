import { appContentKey } from '../../_lib/appHtml.js';

/**
 * Hands the stored file back as a download so it can be opened from local disk
 * and run offline. Unlike the /apps/<id>/ route, this is not a document view:
 * it always carries Content-Disposition: attachment, and it is deliberately
 * NOT sandboxed, because the whole point is to save the original bytes intact.
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
      'content-disposition': `attachment; filename="${id}.html"`,
      'x-content-type-options': 'nosniff',
      'cache-control': 'no-store',
    },
  });
}
