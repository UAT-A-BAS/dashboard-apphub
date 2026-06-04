const SHORTCUTS_KEY = 'shortcuts';

function noStore(payload, init = {}) {
  return Response.json(payload, {
    ...init,
    headers: {
      'cache-control': 'no-store',
      ...(init.headers || {}),
    },
  });
}

export async function onRequestGet({ env }) {
  if (!env.APPHUB_CONFIG) {
    return noStore({ shortcuts: null, configured: false });
  }

  const raw = await env.APPHUB_CONFIG.get(SHORTCUTS_KEY);
  if (!raw) {
    return noStore({ shortcuts: null, configured: true });
  }

  try {
    const payload = JSON.parse(raw);
    return noStore({
      shortcuts: Array.isArray(payload.shortcuts) ? payload.shortcuts : null,
      categories: Array.isArray(payload.categories) ? payload.categories : null,
      updatedAt: payload.updatedAt || null,
      configured: true,
    });
  } catch {
    return noStore({ shortcuts: null, configured: true });
  }
}
