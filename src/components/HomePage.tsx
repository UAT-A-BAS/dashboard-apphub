import { useEffect, useState } from 'react';
import ShortcutGrid from './ShortcutGrid';
import WeatherPanel, { GreetingBlock } from './WeatherPanel';
import { readShortcuts, Shortcut } from '../lib/shortcuts';
import { getThemeFromTime, WeatherMode } from '../lib/weather';

function getInitialRenderMode(): 'standard' | 'lite' {
  const requestedMode = new URLSearchParams(window.location.search).get('render');
  return requestedMode === 'standard' ? 'standard' : 'lite';
}

export default function HomePage() {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => readShortcuts());
  const [theme, setTheme] = useState<WeatherMode>(() => getThemeFromTime());
  const [renderMode, setRenderMode] = useState<'standard' | 'lite'>(() => getInitialRenderMode());

  useEffect(() => {
    const sync = () => setShortcuts(readShortcuts());
    window.addEventListener('storage', sync);
    window.addEventListener('shortcuts-updated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('shortcuts-updated', sync);
    };
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
          <ShortcutGrid shortcuts={shortcuts} />
          <footer className="pb-2 text-center text-sm font-semibold text-white/70">
            Developed by Alex Surya Marcelo (UAT-A) <span aria-hidden="true">•</span> AppHub
          </footer>
        </div>
      </div>
    </main>
  );
}
