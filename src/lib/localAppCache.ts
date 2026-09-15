/**
 * Keeps a copy of each stored app inside this browser, so a later click opens it
 * straight from local storage instead of downloading it again. That is the
 * closest a web page can get to "this file is already on my computer": a page
 * cannot read arbitrary files from disk, but it can keep its own copy and reuse
 * it, and the app then runs entirely from those local bytes.
 *
 * A version stamp is stored alongside the bytes so a re-uploaded file replaces
 * the cached copy instead of serving something stale.
 */

const DB_NAME = 'apphub-local-app-cache';
const DB_VERSION = 1;
const STORE_NAME = 'apps';

export type CachedApp = {
  id: string;
  version: string;
  blob: Blob;
  savedAt: number;
};

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode);
      const request = run(transaction.objectStore(STORE_NAME));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function readCachedApp(id: string) {
  try {
    return (await withStore<CachedApp | undefined>('readonly', (store) => store.get(id))) ?? null;
  } catch {
    return null;
  }
}

export async function writeCachedApp(entry: CachedApp) {
  try {
    await withStore('readwrite', (store) => store.put(entry));
  } catch {
    // Caching is an optimisation; failing to store must not break opening.
  }
}

export async function clearCachedApp(id: string) {
  try {
    await withStore('readwrite', (store) => store.delete(id));
  } catch {
    // Nothing to recover from here.
  }
}

/**
 * Reserve a tab while the click gesture still applies. Popup blockers allow
 * window.open during a user gesture but not after an await, and this flow needs
 * awaits before the bytes are ready.
 */
export function reserveTab() {
  return window.open('about:blank', '_blank');
}

export function closeTab(tab: Window | null) {
  try {
    tab?.close();
  } catch {
    // Closing a tab the page no longer owns is not worth surfacing.
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise<T>((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(fallback);
      });
  });
}

let workerRegistration: Promise<ServiceWorkerRegistration | null> | null = null;

/**
 * Register the worker that serves stored apps from a real URL. Returns null
 * when service workers are unavailable (private mode, unsupported browser), so
 * callers can fall back to the blob route.
 */
export function ensureAppServiceWorker() {
  if (workerRegistration) return workerRegistration;
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    workerRegistration = Promise.resolve(null);
    return workerRegistration;
  }
  workerRegistration = navigator.serviceWorker
    .register('/apphub-app-sw.js', { scope: '/' })
    // Bound activation. `navigator.serviceWorker.ready` can stay pending forever
    // if activation never completes, which would leave the card spinning.
    .then((registration) => withTimeout(navigator.serviceWorker.ready, 8000, null).then(() => registration))
    .catch(() => null);
  return workerRegistration;
}

/**
 * Hand the app's bytes to the worker and return the URL it will be served at.
 * The bytes travel over postMessage rather than a query string, so file size is
 * not bounded by URL length.
 */
export async function publishAppToServiceWorker(id: string, blob: Blob, version: string) {
  const registration = await withTimeout(ensureAppServiceWorker(), 9000, null);
  if (!registration) return '';

  const html = await blob.text();
  const target = registration.active ?? registration.waiting ?? registration.installing;
  if (!target) return '';

  const ready = new Promise<boolean>((resolve) => {
    // Always detach the listener and clear the timer, on success or timeout.
    const finish = (value: boolean) => {
      clearTimeout(timer);
      navigator.serviceWorker.removeEventListener('message', onMessage);
      resolve(value);
    };
    const timer = setTimeout(() => finish(false), 5000);
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'apphub:local-app-ready' && event.data.id === id) {
        finish(true);
      }
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
  });

  target.postMessage({ type: 'apphub:local-app', id, html, version });
  const ok = await ready;
  return ok ? `/local/app/${encodeURIComponent(id)}/` : '';
}

/**
 * Drop every local trace of a stored app: the cached bytes and the copy held by
 * the service worker. Without this, deleting an app in the admin panel would
 * leave the visitor's browser still able to open it, and a re-upload would keep
 * serving the previous version from the worker.
 */
export async function forgetLocalApp(id: string) {
  await clearCachedApp(id);
  try {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const registration = await navigator.serviceWorker.getRegistration('/');
    const target = registration?.active ?? registration?.waiting ?? registration?.installing;
    target?.postMessage({ type: 'apphub:forget-app', id });
  } catch {
    // Best effort: the cached copy is already gone.
  }
}
