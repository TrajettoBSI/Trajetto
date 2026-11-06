export type WeatherKind = 'clear' | 'partlyCloudy' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm';

export function weatherKind(code: number): WeatherKind {
  if (code === 0) return 'clear';
  if (code <= 2) return 'partlyCloudy';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'storm';
  return 'cloudy';
}

export const WEATHER_ICONS: Record<WeatherKind, string> = {
  clear: 'sunny',
  partlyCloudy: 'partly-sunny',
  cloudy: 'cloudy',
  fog: 'cloudy-outline',
  drizzle: 'rainy-outline',
  rain: 'rainy',
  snow: 'snow',
  storm: 'thunderstorm',
};

const FORECAST_DAYS = 16;

export function isBeyondForecast(date: string, today = new Date()): boolean {
  const limit = new Date(today.getFullYear(), today.getMonth(), today.getDate() + FORECAST_DAYS - 1);
  const pad = (n: number) => String(n).padStart(2, '0');
  return date > `${limit.getFullYear()}-${pad(limit.getMonth() + 1)}-${pad(limit.getDate())}`;
}
