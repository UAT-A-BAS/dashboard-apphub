import { describe, expect, it } from 'vitest';
// These are Pages Functions modules. They only touch Cloudflare globals inside
// the handlers, so they can be driven directly with a small KV stand-in.
import { onRequestPost, onRequestPut } from '../../functions/api/admin/apps.js';
import { createSessionToken } from '../../functions/api/admin/_auth.js';

function fakeEnv() {
  const store = new Map<string, string>();
  return {
    ADMIN_PIN: 'pin-owner',
    store,
    APPHUB_CONFIG: {
      get: async (key: string) => (store.has(key) ? store.get(key) : null),
      put: async (key: string, value: string) => {
        store.set(key, value);
      },
      delete: async (key: string) => {
        store.delete(key);
      },
    },
  };
}

async function authedRequest(env: ReturnType<typeof fakeEnv>, method: string, body: unknown) {
  const token = await createSessionToken(env as never);
  return new Request('https://apphub.test/api/admin/apps', {
    method,
    headers: { 'content-type': 'application/json', cookie: `admin_session=${token}` },
    body: JSON.stringify(body),
  });
}

const VERSION_ONE = '<!doctype html><html><body><h1>v1</h1></body></html>';
const VERSION_TWO = '<!doctype html><html><body><h1>v2</h1></body></html>';

describe('onRequestPut', () => {
  it('replaces the stored bytes while keeping the same id and URL', async () => {
    const env = fakeEnv();
    const created = await onRequestPost({ request: await authedRequest(env, 'POST', { name: 'Kalkulator Cuti', html: VERSION_ONE }), env });
    const createdBody = await created.json();
    expect(createdBody.url).toBe('/apps/kalkulator-cuti/');

    const replaced = await onRequestPut({
      request: await authedRequest(env, 'PUT', { id: 'kalkulator-cuti', html: VERSION_TWO }),
      env,
    });
    const replacedBody = await replaced.json();

    expect(replaced.status).toBe(200);
    expect(replacedBody.replaced).toBe(true);
    expect(replacedBody.app.id).toBe('kalkulator-cuti');
    // The id staying put is the whole point: existing cards are not touched.
    expect(replacedBody.url).toBe(createdBody.url);
    expect(replacedBody.app.name).toBe('Kalkulator Cuti');
    expect(env.store.get('apps:item:kalkulator-cuti')).toBe(VERSION_TWO);

    const index = JSON.parse(env.store.get('apps:index') as string);
    expect(index).toHaveLength(1);
    expect(index[0].bytes).toBe(new TextEncoder().encode(VERSION_TWO).byteLength);
  });

  it('bumps uploadedAt so cached copies on other browsers go stale', async () => {
    const env = fakeEnv();
    const first = await onRequestPost({ request: await authedRequest(env, 'POST', { name: 'Satu', html: VERSION_ONE }), env });
    const firstEntry = (await first.json()).app;

    const replaced = await onRequestPut({ request: await authedRequest(env, 'PUT', { id: 'satu', html: VERSION_TWO }), env });
    const secondEntry = (await replaced.json()).app;

    expect(Date.parse(secondEntry.uploadedAt)).toBeGreaterThanOrEqual(Date.parse(firstEntry.uploadedAt));
    expect(secondEntry.uploadedAt).not.toBe('');
  });

  it('accepts a renamed app and keeps the old name when none is given', async () => {
    const env = fakeEnv();
    await onRequestPost({ request: await authedRequest(env, 'POST', { name: 'Nama Lama', html: VERSION_ONE }), env });

    const renamed = await onRequestPut({ request: await authedRequest(env, 'PUT', { id: 'nama-lama', name: 'Nama Baru', html: VERSION_TWO }), env });
    expect((await renamed.json()).app.name).toBe('Nama Baru');

    const kept = await onRequestPut({ request: await authedRequest(env, 'PUT', { id: 'nama-lama', html: VERSION_ONE }), env });
    expect((await kept.json()).app.name).toBe('Nama Baru');
  });

  it('rejects a replacement for an id that is not stored', async () => {
    const env = fakeEnv();
    const response = await onRequestPut({ request: await authedRequest(env, 'PUT', { id: 'tidak-ada', html: VERSION_TWO }), env });
    expect(response.status).toBe(404);
  });

  it('rejects a replacement that is not HTML or is empty', async () => {
    const env = fakeEnv();
    await onRequestPost({ request: await authedRequest(env, 'POST', { name: 'Cek', html: VERSION_ONE }), env });

    const empty = await onRequestPut({ request: await authedRequest(env, 'PUT', { id: 'cek', html: '   ' }), env });
    expect(empty.status).toBe(400);

    const notHtml = await onRequestPut({ request: await authedRequest(env, 'PUT', { id: 'cek', html: '{"a":1}' }), env });
    expect(notHtml.status).toBe(400);

    // A rejected replacement must leave the original file untouched.
    expect(env.store.get('apps:item:cek')).toBe(VERSION_ONE);
  });

  it('requires an admin session', async () => {
    const env = fakeEnv();
    await onRequestPost({ request: await authedRequest(env, 'POST', { name: 'Cek', html: VERSION_ONE }), env });

    const response = await onRequestPut({
      request: new Request('https://apphub.test/api/admin/apps', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: 'cek', html: VERSION_TWO }),
      }),
      env,
    });
    expect(response.status).toBe(401);
    expect(env.store.get('apps:item:cek')).toBe(VERSION_ONE);
  });
});
