import { useEffect, useState } from 'react';
import { Itinerary } from '@/hooks/itineraryStore';
import { DayWeather, weatherService } from '@/services';

const cache = new Map<string, Record<string, DayWeather>>();
const NONE: Record<string, DayWeather> = {};

export function useItineraryWeather(itinerary: Itinerary | null): Record<string, DayWeather> {
  const [, setLoaded] = useState(0);
  const lat = itinerary?.originLatitude ?? itinerary?.places?.[0]?.latitude;
  const lng = itinerary?.originLongitude ?? itinerary?.places?.[0]?.longitude;
  const start = itinerary?.startDate;
  const end = itinerary?.endDate ?? itinerary?.startDate;
  const key = lat != null && lng != null && start && end ? `${lat.toFixed(2)}|${lng.toFixed(2)}|${start}|${end}` : null;

  useEffect(() => {
    if (!key || cache.has(key) || lat == null || lng == null || !start || !end) return;
    let active = true;
    weatherService.getForecast(lat, lng, start, end)
      .then((days) => {
        cache.set(key, Object.fromEntries(days.map((d) => [d.date, d])));
        if (active) setLoaded((n) => n + 1);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [key, lat, lng, start, end]);

  return key ? cache.get(key) ?? NONE : NONE;
}
