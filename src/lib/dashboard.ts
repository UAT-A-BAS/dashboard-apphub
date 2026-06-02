import { Shortcut } from './shortcuts';

export const FAVORITES_STORAGE_KEY = 'apphub.favorites.v1';
export const RECENTS_STORAGE_KEY = 'apphub.recents.v1';
export const MAX_RECENTS = 5;

export type DashboardAction = {
  id: string;
  label: string;
  description: string;
  url: string;
  shortcutId: string;
};

export function readStoredIds(key: string): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function saveStoredIds(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify([...new Set(ids)]));
}

export function toggleStoredFavorite(id: string, favorites: string[]) {
  const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [id, ...favorites];
  saveStoredIds(FAVORITES_STORAGE_KEY, next);
  return next;
}

export function pushRecentShortcut(id: string, recents: string[]) {
  const next = [id, ...recents.filter((item) => item !== id)].slice(0, MAX_RECENTS);
  saveStoredIds(RECENTS_STORAGE_KEY, next);
  return next;
}

export function getQuickActions(shortcuts: Shortcut[]): DashboardAction[] {
  const findShortcut = (needle: string) => shortcuts.find((shortcut) => shortcut.name.toLowerCase().includes(needle));
  const mom = findShortcut('mom');
  const memo = findShortcut('memo');
  const berita = findShortcut('berita');

  return [
    {
      id: 'new-mom',
      label: 'New MoM',
      description: 'Buka MoM Generator',
      url: mom?.url ?? 'https://generate-mom.pages.dev/',
      shortcutId: mom?.id ?? 'notion',
    },
    {
      id: 'new-memo',
      label: 'New Memo',
      description: 'Buka Memo Generator',
      url: memo?.url ?? 'https://generate-memo.pages.dev/',
      shortcutId: memo?.id ?? 'project',
    },
    {
      id: 'new-berita-acara',
      label: 'New Berita Acara',
      description: 'Buka Berita Acara Generator',
      url: berita?.url ?? 'https://generate-berita-acara.pages.dev/',
      shortcutId: berita?.id ?? 'analytics',
    },
  ];
}

export function openExternalUrl(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}
