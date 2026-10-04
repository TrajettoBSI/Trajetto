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

export function formatDistance(m: number) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

export function formatWalk(m: number) {
  const min = Math.round(m / 80);
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)}h ${min % 60}min`;
}

export function formatCar(m: number) {
  const min = Math.round(m / 500);
  if (min < 1) return '< 1 min';
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)}h ${min % 60}min`;
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

function periodAppliesToday(period: string, today: { month: number; day: number }): boolean {
  const rangeMatch = period.match(/^([A-Za-z]{3}\s+\d{1,2})-([A-Za-z]{3}\s+\d{1,2})$/);
  if (rangeMatch) {
    const start = parseMonthDay(rangeMatch[1]);
    const end = parseMonthDay(rangeMatch[2]);
    return !!(start && end && dateInRange(today, start, end));
  }
  const single = parseMonthDay(period);
  return !!(single && single.month === today.month && single.day === today.day);
}

export type OpeningHoursEntry = { period: string; hours: string; closed: boolean; isToday: boolean };

export function parseOpeningHours(raw: string, now = new Date()): OpeningHoursEntry[] {
  if (!raw) return [];
  const today = { month: now.getMonth(), day: now.getDate() };

  return raw
    .split(';')
    .map((s): OpeningHoursEntry | null => {
      const trimmed = s.trim();
      if (!trimmed) return null;

      const offMatch = trimmed.match(/^(.+?)\s+off$/i);
      if (offMatch) {
        const period = offMatch[1].trim();
        return { period, hours: '', closed: true, isToday: periodAppliesToday(period, today) };
      }

      const timeMatch = trimmed.match(/^(.*?)[:\s]*(\d{1,2}:\d{2}-\d{1,2}:\d{2})$/);
      if (!timeMatch) return { period: trimmed, hours: '', closed: false, isToday: false };
      const period = timeMatch[1].replace(/:$/, '').trim();
      const hours = timeMatch[2];
      return { period, hours, closed: false, isToday: periodAppliesToday(period, today) };
    })
    .filter((e): e is OpeningHoursEntry => !!e && (!!e.period || !!e.hours));
}

export function isOpenNow(entries: OpeningHoursEntry[], now = new Date()): boolean | null {
  const todayEntry = entries.find((e) => e.isToday);
  if (!todayEntry) return null;
  if (todayEntry.closed) return false;
  const [openStr, closeStr] = todayEntry.hours.split('-');
  if (!openStr || !closeStr) return null;
  const [openH, openM] = openStr.split(':').map(Number);
  const [closeH, closeM] = closeStr.split(':').map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes >= openH * 60 + openM && nowMinutes < closeH * 60 + closeM;
}
