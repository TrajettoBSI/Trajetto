import { useMemo } from 'react';
import { Itinerary, Places, useItineraryStore } from '@/hooks/itineraryStore';
import { groupByDay, ItineraryDay, resolveDay, toIsoDate } from '@/src/domain/itinerary/itineraryDays';

const NO_PLACES: Places[] = [];

export function useItineraryDay(itinerary: Itinerary | null) {
  const selectedDay = useItineraryStore((state) => state.selectedDay);
  const setSelectedDay = useItineraryStore((state) => state.setSelectedDay);

  const days = useMemo<ItineraryDay<Places>[]>(
    () => (itinerary ? groupByDay(itinerary.startDate, itinerary.places ?? []) : []),
    [itinerary],
  );

  const currentDate = resolveDay(days.map((d) => d.date), selectedDay, toIsoDate(new Date()));
  const currentDay = days.find((d) => d.date === currentDate) ?? null;

  return {
    days,
    currentDay,
    dayPlaces: currentDay?.places ?? NO_PLACES,
    selectDay: setSelectedDay,
  };
}
