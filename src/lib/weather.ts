import { WeatherIconName } from './icons';

const JAKARTA = {
  latitude: -6.1754,
  longitude: 106.8272,
  label: 'Jakarta, Indonesia',
};

const WEATHER_FETCH_TIMEOUT_MS = 6000;

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

function getClearMode(date: Date, isDay: boolean): WeatherMode {
  const hour = date.getHours();
  if (!isDay || hour < 5 || hour >= 19) return 'clearNight';
  if (hour < 11) return 'clearMorning';
  if (hour < 16) return 'clearAfternoon';
  return 'clearEvening';
}

export function getThemeFromWeather(code: number, isDay: boolean, date = new Date()): WeatherMode {
  if ([95, 96, 99].includes(code)) return 'thunderstorm';
  if ([63, 65, 66, 67, 81, 82].includes(code)) return 'heavyRain';
  if ([51, 53, 55, 56, 57, 61, 80].includes(code)) return 'lightRain';
  if ([3, 45, 48].includes(code)) return isDay && date.getHours() < 19 ? 'cloudy' : 'cloudyNight';
  if ([1, 2].includes(code)) return 'partlyCloudy';
  return getClearMode(date, isDay);
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
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,weather_code,precipitation_probability,uv_index',
    timezone: 'auto',
    forecast_days: '1',
    forecast_hours: '12',
  });

  const [location, response] = await Promise.all([
    usedFallback ? Promise.resolve(JAKARTA.label) : reverseGeocode(latitude, longitude).catch(() => JAKARTA.label),
    fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, WEATHER_FETCH_TIMEOUT_MS),
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

export function getThemeFromTime(date = new Date()): WeatherMode {
  const hour = date.getHours();
  return getClearMode(date, hour >= 5 && hour < 19);
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

export function getMotivationalGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 11) return 'Mulailah hari dengan pengujian yang terarah dan terstruktur.';
  if (hour < 15) return 'Tetap fokus pada detail yang menjaga kualitas tetap tinggi.';
  if (hour < 18) return 'Kemajuan kecil yang konsisten membentuk hasil yang berkualitas.';
  return 'Pastikan setiap pekerjaan hari ini meninggalkan dampak yang berarti.';
}

export function formatHour(value: string) {
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}
