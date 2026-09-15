/**
 * Serves stored apps from a real URL so relative paths inside them resolve.
 *
 * Opening an app as a blob: URL broke any library that calls
 * `new URL(relativePath, location.href)`, which throws when the base is a blob
 * URL. Tesseract.js in the PII Masking Tool does exactly that for its
 * corePath/workerPath/langPath, so OCR failed to initialise there while the
 * same file worked when opened from disk.
 *
 * This worker answers /local/app/<id>/ from bytes the page posts to it, so the
 * document gets a normal http(s) URL and relative paths behave. The response
 * carries a sandbox CSP, so the app still runs in an opaque origin and cannot
 * reach the AppHub admin session.
 */

const PAYLOAD_PREFIX = '/local/app/';
const DB_NAME = 'apphub-served-apps';
const DB_VERSION = 1;
const STORE_NAME = 'apps';

/**
 * The worker is stopped whenever it goes idle, so the payloads cannot live in a
 * plain in-memory map: a reload after any quiet period would 404. They are kept
 * in IndexedDB instead, which also survives a worker update.
 */
function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putApp(entry) {
  const db = await openDb();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

async function getApp(id) {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

async function removeApp(id) {
  const db = await openDb();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;
  if (data.type === 'apphub:forget-app') {
    // A deleted app must not stay reachable from this worker copy, and a
    // re-upload must not keep serving the previous version.
    event.waitUntil(removeApp(data.id));
    return;
  }
  if (data.type !== 'apphub:local-app') return;
  // Keep the newest bytes for this id; a re-upload replaces the old copy.
  event.waitUntil(
    putApp({ id: data.id, html: data.html, version: data.version || '' }).then(() => {
      if (event.source && 'postMessage' in event.source) {
        event.source.postMessage({ type: 'apphub:local-app-ready', id: data.id });
      }
    }),
  );
});

function sandboxPolicy() {
  return [
    // allow-same-origin is deliberately absent: the document must stay in an
    // opaque origin so it cannot read AppHub's cookie or storage.
    'sandbox allow-scripts allow-forms allow-modals allow-popups allow-downloads allow-popups-to-escape-sandbox',
    "default-src 'self' blob: data:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    'font-src data: blob: https:',
    'media-src data: blob: https:',
    'connect-src https: data: blob:',
    'worker-src blob: data:',
    "base-uri 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join('; ');
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(PAYLOAD_PREFIX)) return;

  const id = decodeURIComponent(url.pathname.slice(PAYLOAD_PREFIX.length).replace(/\/+$/, ''));
  event.respondWith(
    getApp(id).then((entry) => {
      if (!entry) {
        return new Response('Aplikasi belum disiapkan di browser ini.', { status: 404 });
      }
      // Serve the stored bytes as-is. The app is single-file, so there are no
      // subresources to rewrite and the HTML can be returned untouched.
      return new Response(entry.html, {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'content-security-policy': sandboxPolicy(),
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff',
        },
      });
    }),
  );
});
