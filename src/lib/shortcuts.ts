import { ShortcutIconName, shortcutIconNames } from './icons';

export const SHORTCUT_STORAGE_KEY = 'apphub.shortcuts.v2';
export const MAX_SHORTCUTS = 8;

export type Shortcut = {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: ShortcutIconName;
  color: string;
};

export const defaultShortcuts: Shortcut[] = [
  {
    id: 'notion',
    name: 'MoM Generator',
    description: 'Buat minutes of meeting siap pakai.',
    url: 'https://generate-mom.pages.dev/',
    icon: 'NotebookTabs',
    color: '#151515',
  },
  {
    id: 'project',
    name: 'Memo Generator',
    description: 'Susun memo internal dengan format rapi.',
    url: 'https://generate-memo.pages.dev/',
    icon: 'BriefcaseBusiness',
    color: '#16a34a',
  },
  {
    id: 'analytics',
    name: 'Berita Acara Generator',
    description: 'Buat berita acara untuk kebutuhan UAT.',
    url: 'https://generate-berita-acara.pages.dev/',
    icon: 'LayoutDashboard',
    color: '#4f46e5',
  },
  {
    id: 'clients',
    name: 'Blueprint',
    description: 'Akses knowledge dan storyteller Blueprint.',
    url: 'https://blueprint.bca.co.id/storyteller/#/main',
    icon: 'Users',
    color: '#6d28d9',
  },
  {
    id: 'mail',
    name: 'MySolution',
    description: 'Pantau todo dan workflow operasional.',
    url: 'https://mysolution.bca.co.id/#/todo',
    icon: 'Mail',
    color: '#2563eb',
  },
  {
    id: 'docs',
    name: 'MyDevelopment',
    description: 'Kelola kebutuhan development internal.',
    url: 'https://mydevelopment.bca.co.id/',
    icon: 'FileText',
    color: '#f97316',
  },
  {
    id: 'reports',
    name: 'MyService',
    description: 'Buka layanan HEAT dan request support.',
    url: 'https://myservice/HEAT/',
    icon: 'BarChart3',
    color: '#db2777',
  },
  {
    id: 'settings',
    name: 'MyBcaPortal',
    description: 'Masuk ke portal internal BCA.',
    url: 'https://mybcaportal/Pages/Homepage.aspx',
    icon: 'Settings',
    color: '#52525b',
  },
];

const safeHex = /^#[0-9a-fA-F]{6}$/;

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

export function getShortcutDescription(shortcut: Pick<Shortcut, 'name' | 'url'> & Partial<Pick<Shortcut, 'description'>>) {
  const existing = shortcut.description?.trim();
  if (existing) return existing.slice(0, 86);

  const key = `${shortcut.name} ${getShortcutHost(shortcut.url)}`.toLowerCase();
  if (key.includes('mom')) return 'Buat minutes of meeting siap pakai.';
  if (key.includes('memo')) return 'Susun memo internal dengan format rapi.';
  if (key.includes('berita')) return 'Buat berita acara untuk kebutuhan UAT.';
  if (key.includes('blueprint')) return 'Akses knowledge dan storyteller Blueprint.';
  if (key.includes('mysolution')) return 'Pantau todo dan workflow operasional.';
  if (key.includes('mydevelopment')) return 'Kelola kebutuhan development internal.';
  if (key.includes('myservice')) return 'Buka layanan HEAT dan request support.';
  if (key.includes('mybcaportal')) return 'Masuk ke portal internal BCA.';
  return 'Buka aplikasi internal dengan cepat.';
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
    if (domain.endsWith('.pages.dev')) return [publicIcon];
    if (domain.endsWith('.bca.co.id')) return [`${parsed.origin}/favicon.ico`];
    return [
      `${parsed.origin}/favicon.ico`,
      `${parsed.origin}/favicon.svg`,
      publicIcon,
    ];
  } catch {
    return [];
  }
}

export function sanitizeShortcut(input: Partial<Shortcut>, index: number): Shortcut {
  const fallback = defaultShortcuts[index] ?? defaultShortcuts[0];
  const name = String(input.name || fallback.name).trim().slice(0, 48);
  const url = normalizeUrl(String(input.url || fallback.url));
  return {
    id: String(input.id || crypto.randomUUID()),
    name,
    description: getShortcutDescription({
      name,
      url,
      description: input.description,
    }),
    url,
    icon: (input.icon && shortcutIconNames.includes(input.icon as ShortcutIconName)
      ? input.icon
      : fallback.icon) as ShortcutIconName,
    color: safeHex.test(String(input.color)) ? String(input.color) : fallback.color,
  };
}

export function readShortcuts(): Shortcut[] {
  try {
    const raw = localStorage.getItem(SHORTCUT_STORAGE_KEY);
    if (!raw) return defaultShortcuts;
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : parsed.shortcuts;
    if (!Array.isArray(list)) return defaultShortcuts;
    const stored = list.slice(0, MAX_SHORTCUTS);
    const needsDescriptionMigration = stored.some((item) => typeof item?.description !== 'string');
    const source = needsDescriptionMigration
      ? defaultShortcuts.map((fallback) => stored.find((item) => item?.id === fallback.id) ?? fallback)
      : stored;
    return source.map((item, index) => sanitizeShortcut(item, index));
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
