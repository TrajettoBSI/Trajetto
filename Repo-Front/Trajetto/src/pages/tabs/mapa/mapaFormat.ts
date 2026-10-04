import { PlacesFilter } from '@/services';

export type LatLng = { latitude: number; longitude: number };
export type Region = LatLng & { latitudeDelta: number; longitudeDelta: number };

export function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatHoursMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}min`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

export function formatWalkTime(meters: number): string {
  const minutes = Math.round(meters / 80);
  if (minutes < 60) return `${minutes} min`;
  return formatHoursMinutes(minutes);
}

export function formatCarTime(meters: number): string {
  const minutes = Math.round(meters / 500);
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${minutes} min`;
  return formatHoursMinutes(minutes);
}

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function parseMonthDay(token: string): { month: number; day: number } | null {
  const match = token.trim().match(/^([A-Za-z]{3})\s+(\d{1,2})$/);
  if (!match) return null;
  const month = MONTHS[match[1]];
  if (month === undefined) return null;
  return { month, day: Number(match[2]) };
}

function dateInRange(
  today: { month: number; day: number },
  start: { month: number; day: number },
  end: { month: number; day: number },
): boolean {
  const t = today.month * 100 + today.day;
  const s = start.month * 100 + start.day;
  const e = end.month * 100 + end.day;
  if (s <= e) return t >= s && t <= e;
  return t >= s || t <= e; // intervalo cruza a virada do ano (ex: Out-Fev)
}

export type TodayHours =
  | { kind: 'open'; closesAt: string }
  | { kind: 'beforeOpening'; opensAt: string }
  | { kind: 'closed' }
  | { kind: 'unknown' };

/** Le a string bruta de horarios (periodos separados por ";") e resolve o status de hoje. */
export function resolveTodayHours(raw: string | null | undefined, now = new Date()): TodayHours {
  if (!raw) return { kind: 'unknown' };
  const today = { month: now.getMonth(), day: now.getDate() };

  let matchedHours: string | null = null;
  let matchedOff = false;

  for (const segment of raw.split(';').map((s) => s.trim()).filter(Boolean)) {
    const offMatch = segment.match(/^([A-Za-z]{3}\s+\d{1,2})\s+off$/i);
    if (offMatch) {
      const d = parseMonthDay(offMatch[1]);
      if (d && d.month === today.month && d.day === today.day) matchedOff = true;
      continue;
    }

    const rangeMatch = segment.match(/^([A-Za-z]{3}\s+\d{1,2})-([A-Za-z]{3}\s+\d{1,2}):\s*(\d{2}:\d{2})-(\d{2}:\d{2})$/);
    if (rangeMatch) {
      const start = parseMonthDay(rangeMatch[1]);
      const end = parseMonthDay(rangeMatch[2]);
      if (start && end && dateInRange(today, start, end)) {
        matchedHours = `${rangeMatch[3]}-${rangeMatch[4]}`;
      }
    }
  }

  if (matchedOff) return { kind: 'closed' };
  if (!matchedHours) return { kind: 'unknown' };

  const [openStr, closeStr] = matchedHours.split('-');
  const [openH, openM] = openStr.split(':').map(Number);
  const [closeH, closeM] = closeStr.split(':').map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (nowMinutes < openH * 60 + openM) return { kind: 'beforeOpening', opensAt: openStr };
  if (nowMinutes >= closeH * 60 + closeM) return { kind: 'closed' };
  return { kind: 'open', closesAt: closeStr };
}

export function countActiveFilters(f: PlacesFilter): number {
  let n = 0;
  if (f.category) n++;
  if (f.fee) n++;
  if (f.hasHours) n++;
  if (f.profile) n++;
  if (f.maxDistance) n++;
  return n;
}

export function interpolateAlongPath(coords: LatLng[], t: number): LatLng {
  if (coords.length === 0) return { latitude: 0, longitude: 0 };
  if (coords.length === 1) return coords[0];
  const total = coords.length - 1;
  const pos = t * total;
  const i = Math.min(Math.floor(pos), total - 1);
  const f = pos - i;
  return {
    latitude: coords[i].latitude + (coords[i + 1].latitude - coords[i].latitude) * f,
    longitude: coords[i].longitude + (coords[i + 1].longitude - coords[i].longitude) * f,
  };
}

export function bearing(from: LatLng, to: LatLng): number {
  const dLon = (to.longitude - from.longitude) * Math.PI / 180;
  const lat1 = from.latitude * Math.PI / 180;
  const lat2 = to.latitude * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
