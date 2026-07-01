import { useEffect, useMemo, useState } from 'react';
import { Droplets, MapPin, RefreshCcw, Sun, ThermometerSun, weatherIcons, Wind } from '../lib/icons';
import {
  fetchWeather,
  formatHour,
  getGreeting,
  getMotivationalGreeting,
  getThemeFromCurrentTime,
  getThemeFromTime,
  getThemeFromWeather,
  isWeatherAbortError,
  WeatherData,
  WEATHER_MODE_LABELS,
  WEATHER_MODE_OPTIONS,
  WEATHER_UNAVAILABLE_MESSAGE,
  WeatherMode,
} from '../lib/weather';

const WEATHER_CACHE_KEY = 'apphub.weather.cache.v1';
const WEATHER_CACHE_MAX_AGE_MS = 15 * 60 * 1000;
const WEATHER_STALE_CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;

type WeatherPanelProps = {
  compact?: boolean;
  enableParallax?: boolean;
  onModeChange?: (mode: WeatherMode) => void;
};

function readCachedWeather(maxAgeMs = WEATHER_CACHE_MAX_AGE_MS) {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { savedAt: number; data: WeatherData };
    if (!cached.savedAt || Date.now() - cached.savedAt > maxAgeMs) return null;
    return cached.data;
  } catch {
    return null;
  }
}

function writeCachedWeather(data: WeatherData) {
  try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // Cache failure should not affect the dashboard.
  }
}

export default function WeatherPanel({ compact = false, enableParallax = true, onModeChange }: WeatherPanelProps) {
  const [weather, setWeather] = useState<WeatherData | null>(() => readCachedWeather());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(() => !readCachedWeather());
  const [previewMode, setPreviewMode] = useState<WeatherMode | 'auto'>('auto');
  const [themeClock, setThemeClock] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setThemeClock(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  async function loadWeather(background = false) {
    if (!background) setLoading(true);
    setError('');
    try {
      const nextWeather = await fetchWeather();
      setWeather(nextWeather);
      writeCachedWeather(nextWeather);
    } catch (weatherError) {
      if (isWeatherAbortError(weatherError)) {
        console.info('Weather request aborted.', weatherError);
      } else {
        console.warn('Weather request failed.', weatherError);
      }
      if (!weather) {
        const staleWeather = readCachedWeather(WEATHER_STALE_CACHE_MAX_AGE_MS);
        if (staleWeather) {
          setWeather(staleWeather);
          setError('');
          return;
        }
        setError(WEATHER_UNAVAILABLE_MESSAGE);
      }
    } finally {
      if (!background) setLoading(false);
    }
  }

  useEffect(() => {
    const run = () => void loadWeather(Boolean(weather));
    const idle = window.requestIdleCallback?.(run, { timeout: 1200 });
    if (!idle) {
      const timer = window.setTimeout(run, 250);
      return () => window.clearTimeout(timer);
    }
    return () => window.cancelIdleCallback?.(idle);
  }, []);

  const activeMode =
    previewMode === 'auto'
      ? weather
        ? getThemeFromCurrentTime(weather.weatherCode, themeClock)
        : getThemeFromTime(themeClock)
      : previewMode;

  useEffect(() => {
    onModeChange?.(activeMode);
  }, [activeMode, onModeChange]);

  const Icon = useMemo(() => weatherIcons[weather?.icon ?? 'CloudSun'], [weather?.icon]);
  const modeLabel = WEATHER_MODE_LABELS[activeMode];

  function updatePanelTilt(event: React.PointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -10;
    event.currentTarget.style.setProperty('--tilt-x', `${y.toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${x.toFixed(2)}deg`);
  }

  function resetPanelTilt(event: React.PointerEvent<HTMLElement>) {
    event.currentTarget.style.setProperty('--tilt-x', '0deg');
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
  }

  if (loading) {
    return (
      <section className="weather-panel min-h-[210px]" aria-label="Memuat cuaca">
        <div className="h-16 w-16 rounded-2xl bg-slate-200/80" />
        <div className="space-y-3">
          <div className="h-9 w-28 rounded-full bg-slate-200/80" />
          <div className="h-4 w-44 rounded-full bg-slate-200/80" />
        </div>
      </section>
    );
  }

  if (!weather || error) {
    return (
      <section className="weather-panel" aria-label="Cuaca">
        <div className="weather-panel-head">
          <div>
            <span className="weather-mode-badge">{modeLabel}</span>
            <p className="mt-3 text-lg font-semibold text-slate-900">{error || 'Weather belum tersedia.'}</p>
            <p className="mt-1 text-sm text-slate-500">Fallback Jakarta aktif bila lokasi tidak tersedia.</p>
          </div>
          <ModeSelector value={previewMode} onChange={setPreviewMode} />
        </div>
        <button className="icon-button" type="button" onClick={() => void loadWeather()} aria-label="Muat ulang cuaca">
          <RefreshCcw size={18} />
        </button>
      </section>
    );
  }

  return (
    <section
      className={`weather-panel ${compact ? 'weather-panel-compact' : ''}`}
      aria-label="Cuaca saat ini"
      onPointerMove={enableParallax ? updatePanelTilt : undefined}
      onPointerLeave={enableParallax ? resetPanelTilt : undefined}
    >
      <div className="weather-panel-head">
        <span className="weather-mode-badge">{modeLabel}</span>
        <ModeSelector value={previewMode} onChange={setPreviewMode} />
      </div>

      <div className="weather-current">
        <div className="weather-icon">
          <Icon size={44} strokeWidth={1.8} />
        </div>
        <div>
          <div className="flex items-end gap-2">
            <p className="text-5xl font-semibold leading-none tracking-normal text-slate-950">{weather.temperature}</p>
            <span className="pb-1 text-2xl font-medium text-slate-700">&deg;C</span>
          </div>
          <p className="mt-2 text-base font-medium text-slate-600">{weather.condition}</p>
        </div>
      </div>

      <div className="weather-meta">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <MapPin size={16} />
          <span>{weather.location}</span>
        </div>
        <dl className="weather-metric-grid">
          <div className="weather-metric">
            <ThermometerSun size={17} />
            <dt>Terasa</dt>
            <dd>{weather.apparentTemperature}&deg;C</dd>
          </div>
          <div className="weather-metric">
            <Droplets size={17} />
            <dt>Kelembapan</dt>
            <dd>{weather.humidity}%</dd>
          </div>
          <div className="weather-metric">
            <Wind size={17} />
            <dt>Angin</dt>
            <dd>{weather.windSpeed} km/j</dd>
          </div>
          <div className="weather-metric">
            <Sun size={17} />
            <dt>UV</dt>
            <dd>{weather.uvIndex}</dd>
          </div>
        </dl>
      </div>

      <div className="weather-hourly">
        <div className="weather-hourly-strip">
          {weather.hourly.map((point) => {
            const pointMode = getThemeFromWeather(point.weatherCode, true, new Date(point.time));
            const HourIcon =
              weatherIcons[
                pointMode === 'thunderstorm'
                  ? 'CloudLightning'
                  : pointMode === 'heavyRain' || pointMode === 'lightRain'
                    ? 'CloudRain'
                    : pointMode === 'cloudy' || pointMode === 'cloudyNight'
                      ? 'Cloud'
                      : pointMode === 'partlyCloudy'
                        ? 'CloudSun'
                        : 'Sun'
              ];
            return (
              <div key={point.time} className="hourly-chip">
                <p className="text-xs font-medium text-slate-500">{formatHour(point.time)}</p>
                <HourIcon className="mx-auto mt-2 text-amber-500" size={22} strokeWidth={1.8} />
                <p className="mt-1 text-sm font-semibold text-slate-900">{point.temperature}&deg;C</p>
              </div>
            );
          })}
        </div>
        {weather.usedFallback ? (
          <p className="mt-3 text-xs font-medium text-slate-500">
            Lokasi ditolak atau tidak tersedia. Forecast memakai fallback Jakarta.
          </p>
        ) : null}
      </div>
    </section>
  );
}

type ModeSelectorProps = {
  value: WeatherMode | 'auto';
  onChange: (mode: WeatherMode | 'auto') => void;
};

function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <label className="weather-mode-control">
      <span>Preview</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as WeatherMode | 'auto')}
        aria-label="Preview mode cuaca"
      >
        <option value="auto">Auto</option>
        {WEATHER_MODE_OPTIONS.map((mode) => (
          <option key={mode.value} value={mode.value}>
            {mode.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function GreetingBlock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="hero-copy">
      <p className="hero-date">
        {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(now)}
      </p>
      <div className="mt-4 flex items-end gap-3">
        <h1 className="hero-time">
          {new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).format(now)}
        </h1>
      </div>
      <h2 className="hero-greeting">{getGreeting(now)}.</h2>
      <p className="hero-motivation">{getMotivationalGreeting(now)}</p>
    </div>
  );
}
