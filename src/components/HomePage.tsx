import { useEffect, useMemo, useState } from 'react';
import { Activity, CheckCircle2, Command, FilePlus2, Search, Star } from 'lucide-react';
import CommandPalette from './CommandPalette';
import ShortcutGrid from './ShortcutGrid';
import WeatherPanel, { GreetingBlock } from './WeatherPanel';
import {
  DashboardAction,
  FAVORITES_STORAGE_KEY,
  getQuickActions,
  openExternalUrl,
  pushRecentShortcut,
  readStoredIds,
  RECENTS_STORAGE_KEY,
  toggleStoredFavorite,
} from '../lib/dashboard';
import { readShortcuts, Shortcut } from '../lib/shortcuts';
import { getThemeFromTime, WeatherMode } from '../lib/weather';

export default function HomePage() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => readShortcuts());
  const [theme, setTheme] = useState<WeatherMode>(() => getThemeFromTime());
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => readStoredIds(FAVORITES_STORAGE_KEY));
  const [recents, setRecents] = useState<string[]>(() => readStoredIds(RECENTS_STORAGE_KEY));
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      setShortcuts(readShortcuts());
      setFavorites(readStoredIds(FAVORITES_STORAGE_KEY));
      setRecents(readStoredIds(RECENTS_STORAGE_KEY));
    };
    window.addEventListener('storage', sync);
    window.addEventListener('shortcuts-updated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('shortcuts-updated', sync);
    };
  }, []);

  useEffect(() => {
    const openPalette = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', openPalette);
    return () => window.removeEventListener('keydown', openPalette);
  }, []);

  const quickActions = useMemo(() => getQuickActions(shortcuts), [shortcuts]);
  const filteredShortcuts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return shortcuts;
    return shortcuts.filter((shortcut) => `${shortcut.name} ${shortcut.url}`.toLowerCase().includes(normalized));
  }, [query, shortcuts]);
  const recentShortcuts = useMemo(
    () => recents.map((id) => shortcuts.find((shortcut) => shortcut.id === id)).filter((shortcut): shortcut is Shortcut => Boolean(shortcut)),
    [recents, shortcuts],
  );

  function recordOpen(shortcut: Shortcut) {
    setRecents((current) => pushRecentShortcut(shortcut.id, current));
  }

  function openShortcut(shortcut: Shortcut) {
    recordOpen(shortcut);
    openExternalUrl(shortcut.url);
  }

  function openAction(action: DashboardAction) {
    setRecents((current) => pushRecentShortcut(action.shortcutId, current));
    openExternalUrl(action.url);
  }

  function toggleFavorite(id: string) {
    setFavorites((current) => toggleStoredFavorite(id, current));
  }

  return (
    <main className="home-page min-h-dvh overflow-hidden text-slate-900" data-theme={theme}>
      <div className="home-surface">
        <div className="weather-atmosphere" aria-hidden="true" />
        <div className="hero-glass" />
        <div className="dashboard-shell relative z-10 mx-auto flex min-h-dvh w-full max-w-[1480px] flex-col justify-center gap-8 px-6 py-10 sm:px-10 sm:py-12 lg:px-16 xl:px-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_520px] xl:grid-cols-[1fr_560px]">
            <GreetingBlock />
            <WeatherPanel onModeChange={setTheme} />
          </div>

          <section className="dashboard-controls" aria-label="Dashboard controls">
            <label className="dashboard-search">
              <Search size={19} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search apps" aria-label="Search apps" />
            </label>
            <button className="command-trigger" type="button" onClick={() => setPaletteOpen(true)} aria-label="Open command palette">
              <Command size={18} />
              <span>Command</span>
              <kbd>{navigator.platform.toLowerCase().includes('mac') ? 'Cmd K' : 'Ctrl K'}</kbd>
            </button>
          </section>

          <section className="dashboard-utility-grid" aria-label="Quick dashboard actions">
            <div className="quick-actions-panel">
              <div className="panel-heading">
                <FilePlus2 size={18} />
                <span>Quick Actions</span>
              </div>
              <div className="quick-action-list">
                {quickActions.map((action) => (
                  <button className="quick-action-button" type="button" key={action.id} onClick={() => openAction(action)}>
                    <span>{action.label}</span>
                    <small>{action.description}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="system-status-card" aria-label="System Status">
              <div className="panel-heading">
                <Activity size={18} />
                <span>System Status</span>
              </div>
              <p className="status-summary">All apps operational</p>
              <div className="status-list">
                {shortcuts.slice(0, 4).map((shortcut) => (
                  <span className="status-pill" key={shortcut.id}>
                    <CheckCircle2 size={15} />
                    {shortcut.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="recent-card" aria-label="Recently opened apps">
              <div className="panel-heading">
                <Star size={18} />
                <span>Recently Opened</span>
              </div>
              {recentShortcuts.length ? (
                <div className="recent-list">
                  {recentShortcuts.map((shortcut) => (
                    <button className="recent-chip" type="button" key={shortcut.id} onClick={() => openShortcut(shortcut)}>
                      {shortcut.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="dashboard-empty-note">Open an app and it will appear here.</p>
              )}
            </div>
          </section>

          <ShortcutGrid
            favorites={favorites}
            onOpen={recordOpen}
            onToggleFavorite={toggleFavorite}
            query={query}
            recentIds={recents}
            shortcuts={filteredShortcuts}
          />
          <footer className="pb-2 text-center text-sm font-semibold text-white/70">
            Developed by Alex Surya Marcelo (UAT-A) <span aria-hidden="true">•</span> AppHub
          </footer>
        </div>
      </div>
      <CommandPalette
        actions={quickActions}
        favorites={favorites}
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenAction={openAction}
        onOpenShortcut={openShortcut}
        shortcuts={shortcuts}
      />
    </main>
  );
}
