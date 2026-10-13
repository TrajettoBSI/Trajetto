export type DatedPlace = {
  orderIndex: number;
  visitDate?: string | null;
};

export type ItineraryDay<P extends DatedPlace> = {
  date: string;
  number: number;
  places: P[];
};

export const toIsoDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const addDays = (isoDate: string, days: number) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  return toIsoDate(new Date(y, m - 1, d + days));
};

export const placeDate = (startDate: string, place: DatedPlace) => place.visitDate ?? startDate;

export function groupByDay<P extends DatedPlace>(startDate: string, places: P[], endDate?: string | null): ItineraryDay<P>[] {
  const byDate = new Map<string, P[]>();
  for (let date = startDate; endDate && date <= endDate; date = addDays(date, 1)) {
    byDate.set(date, []);
  }
  [...places]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .forEach((place) => {
      const date = placeDate(startDate, place);
      byDate.set(date, [...(byDate.get(date) ?? []), place]);
    });

  return [...byDate.keys()]
    .sort()
    .map((date, i) => ({ date, number: i + 1, places: byDate.get(date)! }));
}

export function resolveDay(dates: string[], selected: string | null, today: string): string | null {
  if (dates.length === 0) return null;
  if (selected && dates.includes(selected)) return selected;
  if (dates.includes(today)) return today;
  return today > dates[dates.length - 1] ? dates[dates.length - 1] : dates[0];
}
