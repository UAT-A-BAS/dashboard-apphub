import { ShortcutIconName, shortcutIconNames } from './icons';

export const SHORTCUT_STORAGE_KEY = 'apphub.shortcuts.v2';
export const MAX_SHORTCUTS = 8;

export type Shortcut = {
  id: string;
  name: string;
  url: string;
  icon: ShortcutIconName;
  color: string;
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

export function getCustomShortcutIcon(shortcut: Pick<Shortcut, 'name' | 'url'>) {
  const key = `${shortcut.name} ${getShortcutHost(shortcut.url)}`.toLowerCase();
  if (key.includes('blueprint')) return '/brand-icons/blueprint-square.png';
  if (key.includes('myservice')) return '/brand-icons/myservice-square.png';
  if (key.includes('mydevelopment')) return '/brand-icons/mydevelopment-square.png';
  if (key.includes('mybcaportal')) return '/brand-icons/mybcaportal-square.png';
  return '';
}

export function sanitizeShortcut(input: Partial<Shortcut>, index: number): Shortcut {
  const fallback = defaultShortcuts[index] ?? defaultShortcuts[0];
  const name = String(input.name || fallback.name).trim().slice(0, 48);
  const url = normalizeUrl(String(input.url || fallback.url));
  return {
    id: String(input.id || crypto.randomUUID()),
    name,
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
    return list.slice(0, MAX_SHORTCUTS).map((item, index) => sanitizeShortcut(item, index));
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
