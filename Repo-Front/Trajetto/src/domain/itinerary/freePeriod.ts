export type FreePeriod = {
  period: 'morning' | 'afternoon';
  insertAt: number;
};

type TimedPlace = { estimatedVisitTime: string };

const time = (p: TimedPlace) => p.estimatedVisitTime.slice(0, 5);

export function freePeriod(places: TimedPlace[]): FreePeriod | null {
  if (places.length === 0) return null;
  const morning = places.filter((p) => time(p) < '12:30').length;
  const afternoon = places.filter((p) => time(p) >= '12:30' && time(p) < '20:00').length;
  if (morning === 0 && afternoon > 0) return { period: 'morning', insertAt: 0 };
  if (afternoon === 0 && morning > 0) return { period: 'afternoon', insertAt: morning };
  return null;
}
