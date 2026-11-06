import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Itinerary } from '@/hooks/itineraryStore';
import { DayWeather, weatherService } from '@/services';

type WeatherByDate = Record<string, DayWeather>;
type StoredWeather = Record<string, { at: number; days: WeatherByDate }>;

const STORAGE_KEY = 'itinerary_weather';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const NONE: WeatherByDate = {};
const cache = new Map<string, WeatherByDate>();
const refreshed = new Set<string>();

async function readStored(): Promise<StoredWeather> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const isRecent = (at: number) => Date.now() - at < MAX_AGE_MS;

async function saveStored(key: string, days: WeatherByDate) {
  const stored = await readStored();
  const kept = Object.fromEntries(Object.entries(stored).filter(([, entry]) => isRecent(entry.at)));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...kept, [key]: { at: Date.now(), days } })).catch(() => {});
}

export function useItineraryWeather(itinerary: Itinerary | null) {
  const [, setLoaded] = useState(0);
  const [settledKey, setSettledKey] = useState<string | null>(null);
  const lat = itinerary?.originLatitude ?? itinerary?.places?.[0]?.latitude;
  const lng = itinerary?.originLongitude ?? itinerary?.places?.[0]?.longitude;
  const start = itinerary?.startDate;
  const end = itinerary?.endDate ?? itinerary?.startDate;
  const key = lat != null && lng != null && start && end ? `${lat.toFixed(2)}|${lng.toFixed(2)}|${start}|${end}` : null;

  useEffect(() => {
    if (!key || refreshed.has(key) || lat == null || lng == null || !start || !end) return;
    let active = true;

    readStored().then((stored) => {
      const entry = stored[key];
      if (!entry || !isRecent(entry.at) || cache.has(key)) return;
      cache.set(key, entry.days);
      if (active) setLoaded((n) => n + 1);
    });

    weatherService.getForecast(lat, lng, start, end)
      .then((forecast) => {
        if (!forecast.length) return;
        const days = Object.fromEntries(forecast.map((d) => [d.date, d]));
        cache.set(key, days);
        refreshed.add(key);
        saveStored(key, days);
        if (active) setLoaded((n) => n + 1);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setSettledKey(key);
      });

    return () => { active = false; };
  }, [key, lat, lng, start, end]);

  return {
    weatherByDate: key ? cache.get(key) ?? NONE : NONE,
    loading: key != null && !cache.has(key) && settledKey !== key,
  };
}
