import { createSessionToken, getAdminPassword, sessionCookie } from './_auth.js';

export async function onRequestPost({ request, env }) {
  const password = getAdminPassword(env);
  if (!password) {
    return Response.json({ message: 'ADMIN_PIN belum diset di Cloudflare Pages environment variables.' }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const pin = typeof body.pin === 'string' ? body.pin : '';
  if (pin !== password) {
    return Response.json({ message: 'PIN tidak valid.' }, { status: 401 });
  }

  const token = await createSessionToken(env);
  return Response.json(
    { authenticated: true },
    {
      headers: {
        'set-cookie': sessionCookie(request, token),
        'cache-control': 'no-store',
      },
    },
  );
}

export function onRequestGet() {
  return Response.json({ message: 'Method tidak didukung.' }, { status: 405 });
}
