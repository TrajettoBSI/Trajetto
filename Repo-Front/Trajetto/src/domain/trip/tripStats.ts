import { groupByDay } from '@/src/domain/itinerary/itineraryDays';

export type StatPlace = {
  orderIndex: number;
  latitude: number;
  longitude: number;
  estimatedVisitTime: string;
  visitDate?: string | null;
  category?: string | null;
  distanceFromPreviousKm?: number | null;
};

export type StatTrip<P extends StatPlace> = {
  startDate: string;
  endDate?: string | null;
  originLatitude?: number | null;
  originLongitude?: number | null;
  places: P[];
};

export type CategoryCount = { category: string; count: number };

export type DayStats<P extends StatPlace> = {
  number: number;
  date: string;
  stops: P[];
  km: number;
};

export type TripStats<P extends StatPlace> = {
  days: number;
  stops: number;
  km: number;
  categories: CategoryCount[];
  perDay: DayStats<P>[];
};

const byTime = (a: StatPlace, b: StatPlace) => a.estimatedVisitTime.localeCompare(b.estimatedVisitTime);

/** Distancia em linha reta entre dois pontos, em km. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Caminho do dia, em km: usa a distancia que o backend calculou entre as paradas e, quando
 * ela nao vem (roteiros antigos), a linha reta desde a parada anterior ou o ponto de partida.
 */
export function dayKm<P extends StatPlace>(stops: P[], origin: { latitude: number; longitude: number } | null): number {
  const sorted = [...stops].sort(byTime);
  return sorted.reduce((total, place, i) => {
    if (place.distanceFromPreviousKm != null) return total + place.distanceFromPreviousKm;
    const prev = i > 0 ? sorted[i - 1] : origin;
    return prev ? total + haversineKm(prev.latitude, prev.longitude, place.latitude, place.longitude) : total;
  }, 0);
}

/** Os numeros do roteiro que vao no cartao de compartilhar. */
export function tripStats<P extends StatPlace>(trip: StatTrip<P>): TripStats<P> {
  const origin = trip.originLatitude != null && trip.originLongitude != null
    ? { latitude: trip.originLatitude, longitude: trip.originLongitude }
    : null;
  const perDay = groupByDay(trip.startDate, trip.places, trip.endDate)
    .filter((d) => d.places.length > 0)
    .map((d) => ({ number: d.number, date: d.date, stops: [...d.places].sort(byTime), km: dayKm(d.places, origin) }));

  const counts = new Map<string, number>();
  trip.places.forEach((p) => {
    if (p.category) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  });
  const categories = [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));

  return {
    days: perDay.length,
    stops: trip.places.length,
    km: perDay.reduce((total, d) => total + d.km, 0),
    categories,
    perDay,
  };
}
