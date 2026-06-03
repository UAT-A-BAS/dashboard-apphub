import { ShortcutIconName, shortcutIconNames } from './icons';

const LEGACY_SHORTCUT_STORAGE_KEYS = ['apphub.shortcuts.v3', 'apphub.shortcuts.v2'];
export const SHORTCUT_STORAGE_KEY = 'apphub.shortcuts.v4';
const FAVICON_CACHE_KEY = 'apphub.favicons.v1';
const FAVICON_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const MAX_SHORTCUTS = 50;

export type Shortcut = {
  id: string;
  name: string;
  url: string;
  icon: ShortcutIconName;
  color: string;
  iconMode?: 'favicon' | 'custom' | 'generic';
  customIconDataUrl?: string;
};

export const defaultShortcuts: Shortcut[] = [
  {
    id: 'notion',
    name: 'MoM Generator',
    url: 'https://generate-mom.pages.dev/',
    icon: 'NotebookTabs',
    color: '#151515',
  },
  {
    id: 'project',
    name: 'Memo Generator',
    url: 'https://generate-memo.pages.dev/',
    icon: 'BriefcaseBusiness',
    color: '#16a34a',
  },
  {
    id: 'analytics',
    name: 'Berita Acara Generator',
    url: 'https://generate-berita-acara.pages.dev/',
    icon: 'LayoutDashboard',
    color: '#4f46e5',
  },
  {
    id: 'clients',
    name: 'Blueprint',
    url: 'https://blueprint.bca.co.id/storyteller/#/main',
    icon: 'Users',
    color: '#6d28d9',
  },
  {
    id: 'mail',
    name: 'MySolution',
    url: 'https://mysolution.bca.co.id/#/todo',
    icon: 'Mail',
    color: '#2563eb',
  },
  {
    id: 'docs',
    name: 'MyDevelopment',
    url: 'https://mydevelopment.bca.co.id/',
    icon: 'FileText',
    color: '#f97316',
  },
  {
    id: 'reports',
    name: 'MyService',
    url: 'https://myservice/HEAT/',
    icon: 'BarChart3',
    color: '#db2777',
  },
  {
    id: 'settings',
    name: 'MyBcaPortal',
    url: 'https://mybcaportal/Pages/Homepage.aspx',
    icon: 'Settings',
    color: '#52525b',
  },
  {
    id: 'yumi',
    name: 'Yumi',
    url: 'https://yumi.intra.bca.co.id/',
    icon: 'Sparkles',
    color: '#0f766e',
  },
  {
    id: 'teman',
    name: 'TEMAN',
    url: 'https://digitalab.bca.co.id/TFD_Main/MyProjectList',
    icon: 'Users',
    color: '#1d4ed8',
  },
  {
    id: 'training-request',
    name: 'List Request Training',
    url: 'https://bcaoffice365.sharepoint.com/:l:/r/sites/KLA/Lists/Training?e=CLwUm2',
    icon: 'BookOpenText',
    color: '#7c3aed',
  },
  {
    id: 'gfb-request',
    name: 'List Request GFB',
    url: 'https://bcaoffice365.sharepoint.com/sites/TransportSolutions/Lists/Request%20GFB/AllItems.aspx?&xsdata=MDV8MDJ8fDI5YzBhNTFmMTJmODQyNTFkZmU4MDhkZWMxMWZjNTcwfDU5ZGFmMTQwNGFlZTRiNzc4MGY0NGVhOGJlYzg2YzJlfDB8MHw2MzkxNjA1MzkzMzM4NDQ5Njh8VW5rbm93bnxWR1ZoYlhOVFpXTjFjbWwwZVZObGNuWnBZMlY4ZXlKRFFTSTZJbFJsWVcxelgwRlVVRk5sY25acFkyVmZVMUJQVEU5R0lpd2lWaUk2SWpBdU1DNHdNREF3SWl3aVVDSTZJbGRwYmpNeUlpd2lRVTRpT2lKUGRHaGxjaUlzSWxkVUlqb3hNWDA9fDF8TDJOb1lYUnpMekU1T2pWbVpEVXpOamM1WldKaU1qUTBaRE00TXpjME9XVXlZMlkyTmpRMll6ZzRRSFJvY21WaFpDNTJNaTl0WlhOellXZGxjeTh4Tnpnd05EVTNNVEUwTmpJNHw5YzlhOWM0NWJiOTU0NzViNTY4ODA4ZGVjMTFmYzU3MHw2ZjViOTBiMzE3ODQ0OWZiYjAyYzMxN2RiNzNhZTFiNQ%3D%3D&sdata=RHYwQ0MwZmkwWGlXQmJuaVdiSnFBbXVTblZvL1RoSUJNQjRBOFJXNXlxOD0%3D&ovuser=59daf140-4aee-4b77-80f4-4ea8bec86c2e%2Cu075060%40bca.co.id',
    icon: 'CalendarDays',
    color: '#0369a1',
  },
];

const safeHex = /^#[0-9a-fA-F]{6}$/;
const safeIconModes = ['favicon', 'custom', 'generic'];

type FaviconCacheEntry = {
  url?: string;
  failed?: string[];
  savedAt: number;
};

type FaviconCache = Record<string, FaviconCacheEntry>;

export function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 'https://example.com';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
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
    iconMode,
    customIconDataUrl,
  };
}

function parseShortcutList(raw: string | null) {
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  const list = Array.isArray(parsed) ? parsed : parsed.shortcuts;
  return Array.isArray(list) ? list : null;
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

export function createShortcutDraft(index: number): Shortcut {
  return {
    id: crypto.randomUUID(),
    name: `Aplikasi ${index + 1}`,
    url: 'https://example.com',
    icon: 'Home',
    color: '#334155',
    iconMode: 'favicon',
  };
}

export function readShortcuts(): Shortcut[] {
  try {
    const currentList = parseShortcutList(localStorage.getItem(SHORTCUT_STORAGE_KEY));
    if (currentList) return currentList.slice(0, MAX_SHORTCUTS).map((item, index) => sanitizeShortcut(item, index));

    for (const legacyKey of LEGACY_SHORTCUT_STORAGE_KEYS) {
      const legacyList = parseShortcutList(localStorage.getItem(legacyKey));
      if (legacyList) {
        const migrated = appendMissingDefaults(legacyList.slice(0, MAX_SHORTCUTS).map((item, index) => sanitizeShortcut(item, index)));
        localStorage.setItem(SHORTCUT_STORAGE_KEY, JSON.stringify(migrated, null, 2));
        return migrated;
      }
    }

    return defaultShortcuts;
  } catch {
    return defaultShortcuts;
  }
}

export function saveShortcuts(shortcuts: Shortcut[]) {
  const clean = shortcuts.slice(0, MAX_SHORTCUTS).map((item, index) => sanitizeShortcut(item, index));
  localStorage.setItem(SHORTCUT_STORAGE_KEY, JSON.stringify(clean, null, 2));
  window.dispatchEvent(new Event('shortcuts-updated'));
  return clean;
}
