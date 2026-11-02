import { DatedPlace, groupByDay, toIsoDate } from '@/src/domain/itinerary/itineraryDays';

export const VISIT_MINUTES = 60;

export type TimedPlace = DatedPlace & {
  estimatedVisitTime: string;
};

export type TravelStatus = 'beforeTrip' | 'beforeDay' | 'visiting' | 'onTheWay' | 'dayDone' | 'afterTrip';

export type TravelProgress<P extends TimedPlace> = {
  status: TravelStatus;
  date: string;
  dayNumber: number;
  totalDays: number;
  stops: P[];
  currentIndex: number | null;
  nextIndex: number | null;
  doneCount: number;
  done: boolean[];
  minutesToNext: number | null;
  daysUntilTrip: number;
};

const minutesOf = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
};

const daysBetween = (from: string, to: string) => {
  const [y1, m1, d1] = from.split('-').map(Number);
  const [y2, m2, d2] = to.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
};

export function travelProgress<P extends TimedPlace>(
  startDate: string,
  endDate: string | null | undefined,
  places: P[],
  now: Date,
  visited: ReadonlySet<number> = new Set(),
): TravelProgress<P> {
  const days = groupByDay(startDate, places, endDate);
  const today = toIsoDate(now);
  const lastDate = days.length ? days[days.length - 1].date : startDate;
  const daysUntilTrip = Math.max(0, daysBetween(today, startDate));

  const day = days.find((d) => d.date === today) ?? (today < startDate ? days[0] : days[days.length - 1]);
  const stops = [...(day?.places ?? [])].sort((a, b) => minutesOf(a.estimatedVisitTime) - minutesOf(b.estimatedVisitTime));
  const base = {
    date: day?.date ?? startDate,
    dayNumber: day?.number ?? 1,
    totalDays: days.length,
    stops,
    daysUntilTrip,
  };

  if (today < startDate) {
    return { ...base, status: 'beforeTrip', currentIndex: null, nextIndex: stops.length ? 0 : null, doneCount: 0, done: stops.map(() => false), minutesToNext: null };
  }
  if (today > lastDate) {
    return { ...base, status: 'afterTrip', currentIndex: null, nextIndex: null, doneCount: stops.length, done: stops.map(() => true), minutesToNext: null };
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isDone = (p: P, i: number) => visited.has(p.orderIndex) || nowMinutes >= minutesOf(stops[i].estimatedVisitTime) + VISIT_MINUTES;
  const currentIndex = stops.findIndex((p, i) => {
    const start = minutesOf(p.estimatedVisitTime);
    return !isDone(p, i) && nowMinutes >= start && nowMinutes < start + VISIT_MINUTES;
  });
  const nextIndex = stops.findIndex((p, i) => !isDone(p, i) && minutesOf(p.estimatedVisitTime) > nowMinutes);
  const done = stops.map((p, i) => isDone(p, i));
  const doneCount = done.filter(Boolean).length;

  let status: TravelStatus;
  if (currentIndex >= 0) status = 'visiting';
  else if (nextIndex < 0) status = 'dayDone';
  else if (doneCount === 0 && nextIndex === 0) status = 'beforeDay';
  else status = 'onTheWay';

  return {
    ...base,
    status,
    currentIndex: currentIndex >= 0 ? currentIndex : null,
    nextIndex: nextIndex >= 0 ? nextIndex : null,
    doneCount,
    done,
    minutesToNext: nextIndex >= 0 ? minutesOf(stops[nextIndex].estimatedVisitTime) - nowMinutes : null,
  };
}

export function simulatedNow(date: string, time: string, offsetMinutes = 0): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, 0, minutesOf(time) + offsetMinutes);
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function walkingMinutes(km: number) {
  return Math.round((km * 1.3) / 4.8 * 60);
}
