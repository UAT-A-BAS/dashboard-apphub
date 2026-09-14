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

/**
 * Fill a reserved tab with the app. A blob URL keeps the document off the
 * network and runs its scripts, so it behaves like a file opened from disk.
 */
export function fillReservedTab(tab: Window | null, blob: Blob) {
  if (!tab) return false;
  const url = URL.createObjectURL(new Blob([blob], { type: 'text/html' }));
  try {
    tab.location.href = url;
  } catch {
    return false;
  }
  // The tab keeps its own copy of the bytes; free the URL later.
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
  return true;
}

export function closeTab(tab: Window | null) {
  try {
    tab?.close();
  } catch {
    // Closing a tab the page no longer owns is not worth surfacing.
  }
}
