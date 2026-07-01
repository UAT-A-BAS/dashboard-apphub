import { WeatherIconName } from './icons';

const JAKARTA = {
  latitude: -6.1754,
  longitude: 106.8272,
  label: 'Jakarta, Indonesia',
};

const WEATHER_FETCH_TIMEOUT_MS = 9000;
export const WEATHER_UNAVAILABLE_MESSAGE = 'Cuaca belum tersedia. Coba refresh sebentar lagi.';

const MOTIVATIONAL_QUOTES = [
  'Kualitas bukan kebetulan, tetapi hasil dari proses yang konsisten.',
  'Setiap pengujian yang teliti membawa sistem lebih dekat pada keandalan.',
  'Detail kecil sering kali menentukan hasil yang besar.',
  'Fokus pada proses, hasil yang baik akan mengikuti.',
  'Validasi yang baik adalah fondasi dari rilis yang percaya diri.',
  'Pastikan setiap skenario diuji dengan jelas, rapi, dan terukur.',
  'Kemajuan kecil yang konsisten menghasilkan kualitas yang besar.',
  'Kerja yang rapi hari ini mempermudah keputusan esok hari.',
  'Kualitas dimulai dari perhatian pada detail kecil.',
  'Setiap langkah yang terukur mengurangi risiko di masa depan.',
];

type OpenMeteoResponse = {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    is_day: number;
    uv_index?: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
    uv_index?: number[];
  };
};

type WttrResponse = {
  current_condition?: Array<{
    FeelsLikeC?: string;
    humidity?: string;
    temp_C?: string;
    uvIndex?: string;
    weatherCode?: string;
    weatherDesc?: Array<{ value?: string }>;
    windspeedKmph?: string;
  }>;
  nearest_area?: Array<{
    areaName?: Array<{ value?: string }>;
    country?: Array<{ value?: string }>;
  }>;
  weather?: Array<{
    date?: string;
    hourly?: Array<{
      chanceofrain?: string;
      tempC?: string;
      time?: string;
      weatherCode?: string;
    }>;
  }>;
};

export type WeatherPoint = {
  time: string;
  temperature: number;
  weatherCode: number;
  precipitation: number;
};

export type WeatherData = {
  location: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  weatherCode: number;
  isDay: boolean;
  condition: string;
  icon: WeatherIconName;
  theme: WeatherMode;
  hourly: WeatherPoint[];
  usedFallback: boolean;
};

export type WeatherMode =
  | 'clearMorning'
  | 'clearAfternoon'
  | 'clearEvening'
  | 'clearNight'
  | 'partlyCloudy'
  | 'cloudy'
  | 'cloudyNight'
  | 'lightRain'
  | 'heavyRain'
  | 'thunderstorm';

export type WeatherTheme = WeatherMode;

export const WEATHER_MODE_LABELS: Record<WeatherMode, string> = {
  clearMorning: 'PAGI CERAH',
  clearAfternoon: 'SIANG CERAH',
  clearEvening: 'SORE CERAH',
  clearNight: 'MALAM CERAH',
  partlyCloudy: 'CERAH BERAWAN',
  cloudy: 'MENDUNG',
  cloudyNight: 'MALAM MENDUNG',
  lightRain: 'HUJAN RINGAN',
  heavyRain: 'HUJAN LEBAT',
  thunderstorm: 'BADAI / PETIR',
};

export const WEATHER_MODE_OPTIONS = Object.entries(WEATHER_MODE_LABELS).map(([value, label]) => ({
  value: value as WeatherMode,
  label,
}));

function describeWeather(code: number): { label: string; icon: WeatherIconName } {
  if (code === 0) return { label: 'Cerah', icon: 'Sun' };
  if ([1, 2].includes(code)) return { label: 'Cerah berawan', icon: 'CloudSun' };
  if (code === 3) return { label: 'Berawan', icon: 'Cloud' };
  if ([45, 48].includes(code)) return { label: 'Berkabut', icon: 'CloudFog' };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Gerimis', icon: 'CloudDrizzle' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'Hujan', icon: 'CloudRain' };
  if ([95, 96, 99].includes(code)) return { label: 'Badai petir', icon: 'CloudLightning' };
  return { label: 'Berangin', icon: 'Wind' };
}

function describeWttrWeather(code: number, fallbackLabel = 'Cuaca tersedia'): { label: string; icon: WeatherIconName } {
  if (code === 113) return { label: 'Cerah', icon: 'Sun' };
  if ([116, 143].includes(code)) return { label: 'Cerah berawan', icon: 'CloudSun' };
  if ([119, 122, 248, 260].includes(code)) return { label: 'Berawan', icon: 'Cloud' };
  if ([176, 263, 266, 281, 284, 293, 296, 353].includes(code)) return { label: 'Gerimis', icon: 'CloudDrizzle' };
  if ([185, 299, 302, 305, 308, 311, 314, 317, 350, 356, 359, 362, 365].includes(code)) return { label: 'Hujan', icon: 'CloudRain' };
  if ([386, 389, 392, 395].includes(code)) return { label: 'Badai petir', icon: 'CloudLightning' };
  return { label: fallbackLabel, icon: 'Wind' };
}

function getClearMode(date: Date, isDay: boolean): WeatherMode {
  const hour = date.getHours();
  if (!isDay || hour < 6 || hour >= 18) return 'clearNight';
  if (hour < 11) return 'clearMorning';
  if (hour < 16) return 'clearAfternoon';
  return 'clearEvening';
}

export function getThemeFromWeather(code: number, isDay: boolean, date = new Date()): WeatherMode {
  if ([95, 96, 99].includes(code)) return 'thunderstorm';
  if ([63, 65, 66, 67, 81, 82].includes(code)) return 'heavyRain';
  if ([51, 53, 55, 56, 57, 61, 80].includes(code)) return 'lightRain';
  if ([3, 45, 48].includes(code)) return isDay && date.getHours() < 18 ? 'cloudy' : 'cloudyNight';
  if ([1, 2].includes(code)) return isDay && date.getHours() < 18 ? 'partlyCloudy' : 'cloudyNight';
  return getClearMode(date, isDay);
}

function getThemeFromWttrWeather(code: number, isDay: boolean, date = new Date()): WeatherMode {
  if ([386, 389, 392, 395].includes(code)) return 'thunderstorm';
  if ([302, 305, 308, 314, 317, 350, 356, 359, 362, 365].includes(code)) return 'heavyRain';
  if ([176, 185, 263, 266, 281, 284, 293, 296, 299, 311, 353].includes(code)) return 'lightRain';
  if ([119, 122, 143, 248, 260].includes(code)) return isDay && date.getHours() < 18 ? 'cloudy' : 'cloudyNight';
  if (code === 116) return isDay && date.getHours() < 18 ? 'partlyCloudy' : 'cloudyNight';
  return getClearMode(date, isDay);
}

function mapWttrToOpenMeteoCode(code: number) {
  if ([386, 389, 392, 395].includes(code)) return 95;
  if ([302, 305, 308, 314, 317, 350, 356, 359, 362, 365].includes(code)) return 65;
  if ([176, 185, 263, 266, 281, 284, 293, 296, 299, 311, 353].includes(code)) return 61;
  if ([119, 122, 143, 248, 260].includes(code)) return 3;
  if (code === 116) return 2;
  if (code === 113) return 0;
  return 3;
}

function formatCity(payload: Record<string, unknown>) {
  const city = String(payload.city || payload.locality || payload.principalSubdivision || '').trim();
  const country = String(payload.countryName || '').trim();
  return [city, country].filter(Boolean).join(', ') || JAKARTA.label;
}

async function reverseGeocode(latitude: number, longitude: number) {
  const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: 'id',
  }).toString();

  const response = await fetchWithTimeout(url.toString(), WEATHER_FETCH_TIMEOUT_MS);
  if (!response.ok) return JAKARTA.label;
  return formatCity((await response.json()) as Record<string, unknown>);
}

function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => window.clearTimeout(timeout));
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function fetchForecastWithRetry(url: string) {
  const firstResponse = await fetchWithTimeout(url, WEATHER_FETCH_TIMEOUT_MS);
  if (firstResponse.ok || ![429, 500, 502, 503, 504].includes(firstResponse.status)) return firstResponse;
  console.info(`Weather provider returned ${firstResponse.status}. Retrying once.`);
  await sleep(450);
  return fetchWithTimeout(url, WEATHER_FETCH_TIMEOUT_MS);
}

export function isWeatherAbortError(error: unknown) {
  const name = error instanceof DOMException || error instanceof Error ? error.name : '';
  const message = error instanceof Error ? error.message.toLowerCase() : String(error || '').toLowerCase();
  return name === 'AbortError' || message.includes('aborted') || message.includes('signal is aborted');
}

function logWeatherError(label: string, error: unknown) {
  if (isWeatherAbortError(error)) {
    console.info(label, error);
    return;
  }
  console.warn(label, error);
}

function readPosition(): Promise<{ latitude: number; longitude: number; usedFallback: boolean }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ ...JAKARTA, usedFallback: true });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          usedFallback: false,
        });
      },
      () => resolve({ ...JAKARTA, usedFallback: true }),
      { enableHighAccuracy: false, timeout: 2500, maximumAge: 30 * 60 * 1000 },
    );
  });
}

export async function fetchWeather(): Promise<WeatherData> {
  const { latitude, longitude, usedFallback } = await readPosition();
  try {
    return await fetchOpenMeteoWeatherForLocation(latitude, longitude, usedFallback);
  } catch (error) {
    logWeatherError('Weather request failed. Retrying Jakarta fallback when possible.', error);
    if (!usedFallback) {
      try {
        return await fetchOpenMeteoWeatherForLocation(JAKARTA.latitude, JAKARTA.longitude, true);
      } catch (fallbackError) {
        logWeatherError('Jakarta fallback weather request failed.', fallbackError);
      }
    }
    try {
      return await fetchWttrWeatherForLocation(latitude, longitude, usedFallback);
    } catch (backupError) {
      logWeatherError('Backup weather provider request failed.', backupError);
      if (!usedFallback) {
        try {
          return await fetchWttrWeatherForLocation(JAKARTA.latitude, JAKARTA.longitude, true);
        } catch (jakartaBackupError) {
          logWeatherError('Backup Jakarta weather provider request failed.', jakartaBackupError);
        }
      }
    }
    throw new Error(WEATHER_UNAVAILABLE_MESSAGE);
  }
}

async function fetchOpenMeteoWeatherForLocation(latitude: number, longitude: number, usedFallback: boolean): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,weather_code,precipitation_probability,uv_index',
    timezone: 'auto',
    forecast_days: '1',
  });

  const [location, response] = await Promise.all([
    usedFallback ? Promise.resolve(JAKARTA.label) : reverseGeocode(latitude, longitude).catch(() => JAKARTA.label),
    fetchForecastWithRetry(`https://api.open-meteo.com/v1/forecast?${params.toString()}`),
  ]);
  if (!response.ok) throw new Error('Weather forecast gagal dimuat.');
  const data = (await response.json()) as OpenMeteoResponse;
  const startIndex = Math.max(0, data.hourly.time.findIndex((time) => time >= data.current.time));
  const currentDate = new Date(data.current.time);
  const currentUv = data.current.uv_index ?? data.hourly.uv_index?.[startIndex] ?? 0;
  const hourly = data.hourly.time.slice(startIndex, startIndex + 6).map((time, offset) => {
    const index = startIndex + offset;
    return {
      time,
      temperature: Math.round(data.hourly.temperature_2m[index]),
      weatherCode: data.hourly.weather_code[index],
      precipitation: data.hourly.precipitation_probability[index] ?? 0,
    };
  });
  const condition = describeWeather(data.current.weather_code);

  return {
    location,
    temperature: Math.round(data.current.temperature_2m),
    apparentTemperature: Math.round(data.current.apparent_temperature),
    humidity: Math.round(data.current.relative_humidity_2m),
    windSpeed: Math.round(data.current.wind_speed_10m),
    uvIndex: Math.round(currentUv),
    weatherCode: data.current.weather_code,
    isDay: data.current.is_day === 1,
    condition: condition.label,
    icon: condition.icon,
    theme: getThemeFromWeather(data.current.weather_code, data.current.is_day === 1, currentDate),
    hourly,
    usedFallback,
  };
}

function parseNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatWttrLocation(data: WttrResponse, usedFallback: boolean) {
  if (usedFallback) return JAKARTA.label;
  const area = data.nearest_area?.[0];
  const city = area?.areaName?.[0]?.value?.trim();
  const country = area?.country?.[0]?.value?.trim();
  return [city, country].filter(Boolean).join(', ') || JAKARTA.label;
}

function buildWttrHourly(data: WttrResponse): WeatherPoint[] {
  const day = data.weather?.[0];
  const date = day?.date || new Date().toISOString().slice(0, 10);
  return (day?.hourly || []).slice(0, 6).map((point) => {
    const rawTime = String(point.time || '0').padStart(4, '0');
    const hour = rawTime.slice(0, -2).padStart(2, '0');
    const minute = rawTime.slice(-2);
    return {
      time: `${date}T${hour}:${minute}:00`,
      temperature: Math.round(parseNumber(point.tempC)),
      weatherCode: mapWttrToOpenMeteoCode(parseNumber(point.weatherCode)),
      precipitation: Math.round(parseNumber(point.chanceofrain)),
    };
  });
}

async function fetchWttrWeatherForLocation(latitude: number, longitude: number, usedFallback: boolean): Promise<WeatherData> {
  const response = await fetchForecastWithRetry(`https://wttr.in/${latitude},${longitude}?format=j1`);
  if (!response.ok) throw new Error('Backup weather forecast gagal dimuat.');

  const data = (await response.json()) as WttrResponse;
  const current = data.current_condition?.[0];
  if (!current) throw new Error('Backup weather forecast tidak lengkap.');

  const wttrWeatherCode = parseNumber(current.weatherCode);
  const condition = describeWttrWeather(wttrWeatherCode, current.weatherDesc?.[0]?.value || 'Cuaca tersedia');
  const currentDate = new Date();
  const isDay = currentDate.getHours() >= 5 && currentDate.getHours() < 19;

  return {
    location: formatWttrLocation(data, usedFallback),
    temperature: Math.round(parseNumber(current.temp_C)),
    apparentTemperature: Math.round(parseNumber(current.FeelsLikeC, parseNumber(current.temp_C))),
    humidity: Math.round(parseNumber(current.humidity)),
    windSpeed: Math.round(parseNumber(current.windspeedKmph)),
    uvIndex: Math.round(parseNumber(current.uvIndex)),
    weatherCode: mapWttrToOpenMeteoCode(wttrWeatherCode),
    isDay,
    condition: condition.label,
    icon: condition.icon,
    theme: getThemeFromWttrWeather(wttrWeatherCode, isDay, currentDate),
    hourly: buildWttrHourly(data),
    usedFallback,
  };
}

export function getThemeFromTime(date = new Date()): WeatherMode {
  const hour = date.getHours();
  return getClearMode(date, hour >= 6 && hour < 18);
}

export function getThemeFromCurrentTime(code: number, date = new Date()): WeatherMode {
  const hour = date.getHours();
  return getThemeFromWeather(code, hour >= 6 && hour < 18, date);
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

export function getMotivationalGreeting(date = new Date()) {
  return MOTIVATIONAL_QUOTES[date.getDate() % MOTIVATIONAL_QUOTES.length];
}

export function formatHour(value: string) {
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}
