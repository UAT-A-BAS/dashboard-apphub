import { APP_INDEX_KEY } from '../../_lib/appHtml.js';

/**
 * Version stamps for the files stored in AppHub, so a browser can tell whether
 * the copy it already holds is still current without downloading the file again.
 * Only an id and a timestamp are exposed; names and sizes stay behind the admin
 * endpoint.
 */
export async function onRequestGet({ env }) {
  if (!env.APPHUB_CONFIG) {
    return Response.json({ apps: [] }, { headers: { 'cache-control': 'no-store' } });
  }

  const raw = await env.APPHUB_CONFIG.get(APP_INDEX_KEY);
  let entries = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) entries = parsed;
    } catch {
      entries = [];
    }
  }

  return Response.json(
    { apps: entries.map((entry) => ({ id: entry.id, version: entry.uploadedAt ?? '' })) },
    { headers: { 'cache-control': 'no-store' } },
  );
}
