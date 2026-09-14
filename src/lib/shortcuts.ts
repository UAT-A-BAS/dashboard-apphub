import { ShortcutIconName, shortcutIconNames } from './icons';

const LEGACY_SHORTCUT_STORAGE_KEYS = ['apphub.shortcuts.v4', 'apphub.shortcuts.v3', 'apphub.shortcuts.v2'];
export const SHORTCUT_STORAGE_KEY = 'apphub.shortcuts.v5';
const FAVICON_CACHE_KEY = 'apphub.favicons.v1';
const FAVICON_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const MAX_SHORTCUTS = 50;

export type Shortcut = {
  id: string;
  name: string;
  url: string;
  icon: ShortcutIconName;
  color: string;
  categoryId?: string;
  iconMode?: 'favicon' | 'custom' | 'generic';
  customIconDataUrl?: string;
};

export type ShortcutCategory = {
  id: string;
  name: string;
};

export type ShortcutConfig = {
  shortcuts: Shortcut[];
  categories: ShortcutCategory[];
};

export const defaultCategories: ShortcutCategory[] = [
  { id: 'generators', name: 'Generators' },
  { id: 'internal-tools', name: 'Internal Tools' },
  { id: 'requests', name: 'Request Lists' },
];

export const defaultShortcuts: Shortcut[] = [
  {
    id: 'notion',
    name: 'MoM Generator',
    url: 'https://generate-mom.pages.dev/',
    icon: 'NotebookTabs',
    color: '#151515',
    categoryId: 'generators',
  },
  {
    id: 'project',
    name: 'Memo Generator',
    url: 'https://generate-memo.pages.dev/',
    icon: 'BriefcaseBusiness',
    color: '#16a34a',
    categoryId: 'generators',
  },
  {
    id: 'analytics',
    name: 'Berita Acara Generator',
    url: 'https://generate-berita-acara.pages.dev/',
    icon: 'LayoutDashboard',
    color: '#4f46e5',
    categoryId: 'generators',
  },
  {
    id: 'clients',
    name: 'Blueprint',
    url: 'https://blueprint.bca.co.id/storyteller/#/main',
    icon: 'Users',
    color: '#6d28d9',
    categoryId: 'internal-tools',
  },
  {
    id: 'mail',
    name: 'MySolution',
    url: 'https://mysolution.bca.co.id/#/todo',
    icon: 'Mail',
    color: '#2563eb',
    categoryId: 'internal-tools',
  },
  {
    id: 'docs',
    name: 'MyDevelopment',
    url: 'https://mydevelopment.bca.co.id/',
    icon: 'FileText',
    color: '#f97316',
    categoryId: 'internal-tools',
  },
  {
    id: 'reports',
    name: 'MyService',
    url: 'https://myservice/HEAT/',
    icon: 'BarChart3',
    color: '#db2777',
    categoryId: 'internal-tools',
  },
  {
    id: 'settings',
    name: 'MyBcaPortal',
    url: 'https://mybcaportal/Pages/Homepage.aspx',
    icon: 'Settings',
    color: '#52525b',
    categoryId: 'internal-tools',
  },
  {
    id: 'yumi',
    name: 'Yumi',
    url: 'https://yumi.intra.bca.co.id/',
    icon: 'Sparkles',
    color: '#0f766e',
    categoryId: 'internal-tools',
  },
  {
    id: 'teman',
    name: 'TEMAN',
    url: 'https://digitalab.bca.co.id/TFD_Main/MyProjectList',
    icon: 'Users',
    color: '#1d4ed8',
    categoryId: 'internal-tools',
  },
  {
    id: 'training-request',
    name: 'List Request Training',
    url: 'https://bcaoffice365.sharepoint.com/:l:/r/sites/KLA/Lists/Training?e=CLwUm2',
    icon: 'BookOpenText',
    color: '#7c3aed',
    categoryId: 'requests',
  },
  {
    id: 'gfb-request',
    name: 'List Request GFB',
    url: 'https://bcaoffice365.sharepoint.com/sites/TransportSolutions/Lists/Request%20GFB/AllItems.aspx?&xsdata=MDV8MDJ8fDI5YzBhNTFmMTJmODQyNTFkZmU4MDhkZWMxMWZjNTcwfDU5ZGFmMTQwNGFlZTRiNzc4MGY0NGVhOGJlYzg2YzJlfDB8MHw2MzkxNjA1MzkzMzM4NDQ5Njh8VW5rbm93bnxWR1ZoYlhOVFpXTjFjbWwwZVZObGNuWnBZMlY4ZXlKRFFTSTZJbFJsWVcxelgwRlVVRk5sY25acFkyVmZVMUJQVEU5R0lpd2lWaUk2SWpBdU1DNHdNREF3SWl3aVVDSTZJbGRwYmpNeUlpd2lRVTRpT2lKUGRHaGxjaUlzSWxkVUlqb3hNWDA9fDF8TDJOb1lYUnpMekU1T2pWbVpEVXpOamM1WldKaU1qUTBaRE00TXpjME9XVXlZMlkyTmpRMll6ZzRRSFJvY21WaFpDNTJNaTl0WlhOellXZGxjeTh4Tnpnd05EVTNNVEUwTmpJNHw5YzlhOWM0NWJiOTU0NzViNTY4ODA4ZGVjMTFmYzU3MHw2ZjViOTBiMzE3ODQ0OWZiYjAyYzMxN2RiNzNhZTFiNQ%3D%3D&sdata=RHYwQ0MwZmkwWGlXQmJuaVdiSnFBbXVTblZvL1RoSUJNQjRBOFJXNXlxOD0%3D&ovuser=59daf140-4aee-4b77-80f4-4ea8bec86c2e%2Cu075060%40bca.co.id',
    icon: 'CalendarDays',
    color: '#0369a1',
    categoryId: 'requests',
  },
];

const safeHex = /^#[0-9a-fA-F]{6}$/;
const safeIconModes = ['favicon', 'custom', 'generic'];

// Hosts reachable only from the machine that runs the server. Browsers allow
// plain http for these even when the page itself is served over https.
const LOCAL_HOST_PATTERN =
  /^(localhost|0\.0\.0\.0|::1|\[::1\]|127\.\d{1,3}\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|[a-z0-9-]+\.local)$/i;

type FaviconCacheEntry = {
  url?: string;
  failed?: string[];
  savedAt: number;
};

type FaviconCache = Record<string, FaviconCacheEntry>;

function parseHostname(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  try {
    return new URL(withScheme).hostname.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * True when the URL points at the visitor's own machine (localhost, loopback,
 * private LAN address, or a `.local` name). Such links only work on the device
 * that runs the server, and must use http because a local server rarely has
 * a trusted TLS certificate.
 */
export function isLocalHostTarget(value: string) {
  const hostname = parseHostname(value);
  return Boolean(hostname) && LOCAL_HOST_PATTERN.test(hostname);
}

export function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 'https://example.com';
  if (trimmed.startsWith('file:') || trimmed.startsWith('//')) return trimmed;
  // A leading slash is an app-relative path, such as a file hosted at
  // /apps/<id>/. Prefixing a scheme would turn it into https:///apps/<id>/,
  // which is not a URL at all. Keep it relative so it resolves against AppHub.
  if (trimmed.startsWith('/')) return trimmed;
  // Repair cards saved while that bug existed, so they start working again
  // without the owner having to re-add them by hand.
  const brokenScheme = trimmed.match(/^https?:\/{3,}(.*)$/i);
  if (brokenScheme) return `/${brokenScheme[1].replace(/^\/+/, '')}`;
  if (/^https?:\/\//i.test(trimmed)) {
    // A local server cannot present a certificate the browser will trust, so a
    // typed https://localhost:... link would always fail. Fall back to http.
    return /^https:\/\//i.test(trimmed) && isLocalHostTarget(trimmed) ? `http://${trimmed.slice('https://'.length)}` : trimmed;
  }
  return `${isLocalHostTarget(trimmed) ? 'http' : 'https'}://${trimmed}`;
}

export function getShortcutHost(url: string) {
  try {
    return new URL(normalizeUrl(url)).host.replace(/^www\./, '');
  } catch {
    return 'invalid-url';
  }
}

function readFaviconCache(): FaviconCache {
  try {
    const raw = localStorage.getItem(FAVICON_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as FaviconCache) : {};
  } catch {
    return {};
  }
}

function writeFaviconCache(cache: FaviconCache) {
  try {
    localStorage.setItem(FAVICON_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Favicon cache is optional and must not affect shortcuts.
  }
}

function readFreshFaviconEntry(host: string) {
  const entry = readFaviconCache()[host];
  if (!entry || Date.now() - entry.savedAt > FAVICON_CACHE_MAX_AGE_MS) return null;
  return entry;
}

export function getCustomShortcutIcon(shortcut: Pick<Shortcut, 'name' | 'url'>) {
  const key = `${shortcut.name} ${getShortcutHost(shortcut.url)}`.toLowerCase();
  if (key.includes('blueprint')) return '/brand-icons/blueprint-square.png';
  if (key.includes('myservice')) return '/brand-icons/myservice-square.png';
  if (key.includes('mydevelopment')) return '/brand-icons/mydevelopment-square.png';
  if (key.includes('mybcaportal')) return '/brand-icons/mybcaportal-square.png';
  return '';
}

export function getFaviconCandidates(url: string) {
  try {
    const parsed = new URL(normalizeUrl(url));
    const domain = parsed.hostname;
    const publicIcon = `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`;
    if (!domain.includes('.')) return [];
    const entry = readFreshFaviconEntry(domain);
    const failed = new Set(entry?.failed ?? []);
    const baseCandidates = domain.endsWith('.pages.dev')
      ? [publicIcon]
      : domain.endsWith('.bca.co.id')
        ? [`${parsed.origin}/favicon.ico`]
        : [`${parsed.origin}/favicon.ico`, `${parsed.origin}/favicon.svg`, publicIcon];
    const candidates = baseCandidates.filter((candidate) => !failed.has(candidate));
    return entry?.url && !failed.has(entry.url) ? [entry.url, ...candidates.filter((candidate) => candidate !== entry.url)] : candidates;
  } catch {
    return [];
  }
}

export function rememberFaviconSuccess(shortcutUrl: string, faviconUrl: string) {
  try {
    const host = new URL(normalizeUrl(shortcutUrl)).hostname;
    const cache = readFaviconCache();
    cache[host] = { url: faviconUrl, failed: [], savedAt: Date.now() };
    writeFaviconCache(cache);
  } catch {
    // Ignore invalid URLs.
  }
}

export function rememberFaviconFailure(shortcutUrl: string, faviconUrl: string) {
  try {
    const host = new URL(normalizeUrl(shortcutUrl)).hostname;
    const cache = readFaviconCache();
    const previous = readFreshFaviconEntry(host);
    const failed = new Set(previous?.failed ?? []);
    failed.add(faviconUrl);
    cache[host] = {
      url: previous?.url === faviconUrl ? undefined : previous?.url,
      failed: Array.from(failed).slice(-5),
      savedAt: Date.now(),
    };
    writeFaviconCache(cache);
  } catch {
    // Ignore invalid URLs.
  }
}

export function sanitizeShortcut(input: Partial<Shortcut>, index: number): Shortcut {
  const fallback = defaultShortcuts[index] ?? defaultShortcuts[0];
  const name = String(input.name || fallback.name).trim().slice(0, 48);
  const url = normalizeUrl(String(input.url || fallback.url));
  const categoryId = String(input.categoryId || fallback.categoryId || defaultCategories[0].id).trim().slice(0, 64);
  const iconMode = safeIconModes.includes(String(input.iconMode)) ? (input.iconMode as Shortcut['iconMode']) : 'favicon';
  const customIconDataUrl =
    typeof input.customIconDataUrl === 'string' && input.customIconDataUrl.startsWith('data:image/')
      ? input.customIconDataUrl.slice(0, 350_000)
      : undefined;
  return {
    id: String(input.id || crypto.randomUUID()),
    name,
    url,
    icon: (input.icon && shortcutIconNames.includes(input.icon as ShortcutIconName)
      ? input.icon
      : fallback.icon) as ShortcutIconName,
    color: safeHex.test(String(input.color)) ? String(input.color) : fallback.color,
    categoryId,
    iconMode,
    customIconDataUrl,
  };
}

export function sanitizeCategory(input: Partial<ShortcutCategory>, index: number): ShortcutCategory {
  const fallback = defaultCategories[index] ?? defaultCategories[0];
  const id = String(input.id || crypto.randomUUID()).trim().slice(0, 64);
  const name = String(input.name || fallback.name || `Kategori ${index + 1}`).trim().slice(0, 48);
  return { id, name };
}

function parseStoredConfig(raw: string | null): Partial<ShortcutConfig> | null {
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return { shortcuts: parsed };
  if (parsed && typeof parsed === 'object') {
    return {
      shortcuts: Array.isArray(parsed.shortcuts) ? parsed.shortcuts : undefined,
      categories: Array.isArray(parsed.categories) ? parsed.categories : undefined,
    };
  }
  return null;
}

function appendMissingDefaults(shortcuts: Shortcut[]) {
  const ids = new Set(shortcuts.map((item) => item.id));
  const names = new Set(shortcuts.map((item) => item.name.toLowerCase()));
  const next = [...shortcuts];
  defaultShortcuts.forEach((shortcut) => {
    if (!ids.has(shortcut.id) && !names.has(shortcut.name.toLowerCase())) {
      next.push(shortcut);
    }
  });
  return next.slice(0, MAX_SHORTCUTS);
}

/**
 * Collapse cards that are the same app: identical name and identical URL.
 * Uploading a file and then also pressing "Tambah Kartu" used to leave two
 * entries for one app, which looked like the delete button had failed.
 * Only exact name+URL pairs are merged, so two deliberately different cards
 * pointing at one URL (different icons, say) are left alone.
 */
export function dedupeShortcuts(shortcuts: Shortcut[]) {
  // Walk backwards so the most recently placed entry wins; that is the one the
  // owner is most likely to have just edited, including its icon and color.
  const keptByKey = new Map<string, Shortcut>();
  for (let index = shortcuts.length - 1; index >= 0; index -= 1) {
    const shortcut = shortcuts[index];
    const key = `${shortcut.name.trim().toLowerCase()}\u0000${shortcut.url.trim().toLowerCase()}`;
    if (!keptByKey.has(key)) keptByKey.set(key, shortcut);
  }
  const keepIds = new Set([...keptByKey.values()].map((shortcut) => shortcut.id));
  return shortcuts.filter((shortcut) => keepIds.has(shortcut.id));
}

function normalizeConfig(input: Partial<ShortcutConfig> | null, appendDefaults = false): ShortcutConfig {
  const categories = (input?.categories?.length ? input.categories : defaultCategories).map((item, index) => sanitizeCategory(item, index));
  const categoryIds = new Set(categories.map((item) => item.id));
  const shortcuts = (input?.shortcuts?.length ? input.shortcuts : defaultShortcuts).slice(0, MAX_SHORTCUTS).map((item, index) => {
    const shortcut = sanitizeShortcut(item, index);
    return categoryIds.has(shortcut.categoryId || '') ? shortcut : { ...shortcut, categoryId: categories[0].id };
  });
  // Dedupe here so duplicate cards self-heal on read and cannot be written back.
  const finalShortcuts = dedupeShortcuts(appendDefaults ? appendMissingDefaults(shortcuts) : shortcuts);
  return {
    shortcuts: finalShortcuts.map((shortcut) => (categoryIds.has(shortcut.categoryId || '') ? shortcut : { ...shortcut, categoryId: categories[0].id })),
    categories,
  };
}

export function createCategoryDraft(index: number): ShortcutCategory {
  return {
    id: crypto.randomUUID(),
    name: `Kategori ${index + 1}`,
  };
}

export function createShortcutDraft(index: number): Shortcut {
  return {
    id: crypto.randomUUID(),
    name: `Aplikasi ${index + 1}`,
    url: 'https://example.com',
    icon: 'Home',
    color: '#334155',
    categoryId: defaultCategories[0].id,
    iconMode: 'favicon',
  };
}

export function readShortcutConfig(): ShortcutConfig {
  try {
    const currentConfig = parseStoredConfig(localStorage.getItem(SHORTCUT_STORAGE_KEY));
    if (currentConfig?.shortcuts) return normalizeConfig(currentConfig);

    for (const legacyKey of LEGACY_SHORTCUT_STORAGE_KEYS) {
      const legacyConfig = parseStoredConfig(localStorage.getItem(legacyKey));
      if (legacyConfig?.shortcuts) {
        const migrated = normalizeConfig(legacyConfig, true);
        localStorage.setItem(SHORTCUT_STORAGE_KEY, JSON.stringify(migrated, null, 2));
        return migrated;
      }
    }

    return normalizeConfig(null, true);
  } catch {
    return normalizeConfig(null, true);
  }
}

export function readShortcuts(): Shortcut[] {
  return readShortcutConfig().shortcuts;
}

export function saveShortcutConfig(config: Partial<ShortcutConfig>) {
  const clean = normalizeConfig(config);
  localStorage.setItem(SHORTCUT_STORAGE_KEY, JSON.stringify(clean, null, 2));
  window.dispatchEvent(new Event('shortcuts-updated'));
  return clean;
}

export function saveShortcuts(shortcuts: Shortcut[]) {
  return saveShortcutConfig({ ...readShortcutConfig(), shortcuts }).shortcuts;
}

export async function fetchGlobalShortcutConfig() {
  const response = await fetch('/api/shortcuts', {
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { shortcuts?: unknown; categories?: unknown };
  if (!Array.isArray(payload.shortcuts)) return null;
  return normalizeConfig({
    shortcuts: payload.shortcuts as Shortcut[],
    categories: Array.isArray(payload.categories) ? (payload.categories as ShortcutCategory[]) : undefined,
  });
}

export async function fetchGlobalShortcuts() {
  return (await fetchGlobalShortcutConfig())?.shortcuts ?? null;
}

export async function saveGlobalShortcutConfig(config: Partial<ShortcutConfig>) {
  const clean = normalizeConfig(config);
  const response = await fetch('/api/admin/shortcuts', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(clean),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: 'Gagal menyimpan shortcut global.' }));
    throw new Error(String(payload.message || 'Gagal menyimpan shortcut global.'));
  }

  saveShortcutConfig(clean);
  return clean;
}

export async function saveGlobalShortcuts(shortcuts: Shortcut[]) {
  return (await saveGlobalShortcutConfig({ ...readShortcutConfig(), shortcuts })).shortcuts;
}
