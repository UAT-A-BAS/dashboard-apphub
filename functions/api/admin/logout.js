import { clearSessionCookie } from './_auth.js';

export function onRequestPost() {
  return Response.json(
    { authenticated: false },
    {
      headers: {
        'set-cookie': clearSessionCookie(),
        'cache-control': 'no-store',
      },
    },
  );
}
