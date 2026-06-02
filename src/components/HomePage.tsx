import { useEffect, useState } from 'react';
import ShortcutGrid from './ShortcutGrid';
import WeatherPanel, { GreetingBlock } from './WeatherPanel';
import { readShortcuts, Shortcut } from '../lib/shortcuts';
import { getThemeFromTime, WeatherMode } from '../lib/weather';

export default function HomePage() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => readShortcuts());
  const [theme, setTheme] = useState<WeatherMode>(() => getThemeFromTime());

  useEffect(() => {
    const sync = () => setShortcuts(readShortcuts());
    window.addEventListener('storage', sync);
    window.addEventListener('shortcuts-updated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('shortcuts-updated', sync);
    };
  }, []);

  return (
    <main className="home-page min-h-dvh overflow-hidden text-slate-900" data-theme={theme}>
      <div className="home-surface">
        <div className="weather-atmosphere" aria-hidden="true" />
        <div className="hero-glass" />
        <div className="dashboard-shell relative z-10 mx-auto flex min-h-dvh w-full max-w-[1720px] flex-col justify-center gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:px-12 xl:px-14">
          <div className="weather-hero-grid grid items-center gap-10 lg:grid-cols-[minmax(360px,0.58fr)_minmax(720px,1fr)] xl:grid-cols-[minmax(380px,0.5fr)_minmax(900px,1fr)]">
            <GreetingBlock />
            <WeatherPanel onModeChange={setTheme} />
          </div>
          <ShortcutGrid shortcuts={shortcuts} />
          <footer className="pb-2 text-center text-sm font-semibold text-white/70">
            Developed by Alex Surya Marcelo (UAT-A) <span aria-hidden="true">•</span> AppHub
          </footer>
        </div>
      </div>
    </main>
  );
}
