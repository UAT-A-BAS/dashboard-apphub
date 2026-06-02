import { readSessionCookie, verifySessionToken } from './_auth.js';

export async function onRequestGet({ request, env }) {
  const authenticated = await verifySessionToken(env, readSessionCookie(request));
  return Response.json(
    { authenticated },
    {
      headers: {
        'cache-control': 'no-store',
      },
    },
  );
}
