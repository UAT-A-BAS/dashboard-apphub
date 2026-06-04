import { useEffect, useState } from 'react';
import ShortcutGrid from './ShortcutGrid';
import WeatherPanel, { GreetingBlock } from './WeatherPanel';
import { Search } from '../lib/icons';
import {
  fetchGlobalShortcutConfig,
  readShortcutConfig,
  saveShortcutConfig,
  Shortcut,
  ShortcutCategory,
} from '../lib/shortcuts';
import { getThemeFromTime, WeatherMode } from '../lib/weather';

function getInitialRenderMode(): 'standard' | 'lite' {
  const requestedMode = new URLSearchParams(window.location.search).get('render');
  return requestedMode === 'standard' ? 'standard' : 'lite';
}

export default function HomePage() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => readShortcutConfig().shortcuts);
  const [categories, setCategories] = useState<ShortcutCategory[]>(() => readShortcutConfig().categories);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'default' | 'az' | 'za'>('default');
  const [theme, setTheme] = useState<WeatherMode>(() => getThemeFromTime());
  const [renderMode, setRenderMode] = useState<'standard' | 'lite'>(() => getInitialRenderMode());

  useEffect(() => {
    const sync = () => {
      const config = readShortcutConfig();
      setShortcuts(config.shortcuts);
      setCategories(config.categories);
    };
    window.addEventListener('storage', sync);
    window.addEventListener('shortcuts-updated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('shortcuts-updated', sync);
    };
  }, []);

  useEffect(() => {
    void fetchGlobalShortcutConfig().then((globalConfig) => {
      if (!globalConfig) return;
      const clean = saveShortcutConfig(globalConfig);
      setShortcuts(clean.shortcuts);
      setCategories(clean.categories);
    });
  }, []);

  useEffect(() => {
    const nav = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };
    const cpuCores = nav.hardwareConcurrency ?? 8;
    const deviceMemory = nav.deviceMemory ?? 8;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPowerDevice = cpuCores <= 8 || deviceMemory <= 4;
    const requestedMode = new URLSearchParams(window.location.search).get('render');
    setRenderMode(requestedMode === 'standard' && !nav.connection?.saveData && !prefersReducedMotion && !lowPowerDevice ? 'standard' : 'lite');
  }, []);

  return (
    <main className="home-page min-h-dvh overflow-x-hidden text-slate-900" data-theme={theme} data-render={renderMode}>
      <div className="home-surface">
        <div className="weather-atmosphere" aria-hidden="true" />
        <div className="hero-glass" />
        <div className="dashboard-shell relative z-10 mx-auto flex min-h-dvh w-full max-w-[1660px] flex-col justify-center gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 xl:px-10">
          <section className="dashboard-hero-card">
            <GreetingBlock />
            <WeatherPanel enableParallax={renderMode === 'standard'} onModeChange={setTheme} />
          </section>
          <section className="app-toolbar" aria-label="Cari dan urutkan aplikasi">
            <div className="app-search-shell">
              <Search size={18} strokeWidth={2.2} />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search apps"
                aria-label="Search apps by name"
              />
            </div>
            <div className="app-sort-control" aria-label="Urutkan aplikasi">
              {[
                { value: 'default', label: 'Default' },
                { value: 'az', label: 'A-Z' },
                { value: 'za', label: 'Z-A' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={sortMode === option.value ? 'active' : ''}
                  onClick={() => setSortMode(option.value as 'default' | 'az' | 'za')}
                  aria-pressed={sortMode === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>
          <ShortcutGrid shortcuts={shortcuts} categories={categories} query={searchQuery} sortMode={sortMode} />
          <footer className="pb-2 text-center text-sm font-semibold text-white/70">
            Developed by Alex Surya Marcelo (UAT-A) <span aria-hidden="true">•</span> AppHub
          </footer>
        </div>
      </div>
    </main>
  );
}
