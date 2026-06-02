import { useEffect, useMemo, useState } from 'react';
import { Droplets, MapPin, RefreshCcw, Sun, ThermometerSun, Wind } from 'lucide-react';
import { weatherIcons } from '../lib/icons';
import {
  fetchWeather,
  formatHour,
  getGreeting,
  getMotivationalGreeting,
  getThemeFromTime,
  getThemeFromWeather,
  WeatherData,
  WEATHER_MODE_LABELS,
  WEATHER_MODE_OPTIONS,
  WeatherMode,
} from '../lib/weather';

type WeatherPanelProps = {
  compact?: boolean;
  onModeChange?: (mode: WeatherMode) => void;
};

export default function WeatherPanel({ compact = false, onModeChange }: WeatherPanelProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState<WeatherMode | 'auto'>('auto');

  async function loadWeather() {
    setLoading(true);
    setError('');
    try {
      const nextWeather = await fetchWeather();
      setWeather(nextWeather);
    } catch (weatherError) {
      setError(weatherError instanceof Error ? weatherError.message : 'Weather gagal dimuat.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWeather();
  }, []);

  const activeMode = previewMode === 'auto' ? weather?.theme ?? getThemeFromTime() : previewMode;

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
      <section className="weather-panel min-h-[210px] animate-pulse" aria-label="Memuat cuaca">
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
      onPointerMove={updatePanelTilt}
      onPointerLeave={resetPanelTilt}
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
