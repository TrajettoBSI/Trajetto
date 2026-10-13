import { useEffect, useMemo, useRef, useState } from 'react';
import { Places } from '@/hooks/itineraryStore';
import { NearbyPlace, placesService } from '@/services';
import { MealSlot, mealSlots } from '@/src/domain/itinerary/mealSlots';

const RADIUS_METERS = 1200;
const OPTIONS_PER_MEAL = 3;

export type MealSuggestion = MealSlot<Places> & {
  key: string;
  options: NearbyPlace[] | null;
};

const slotKey = (slot: MealSlot<Places>) =>
  `${slot.meal.id}-${slot.anchor.latitude}-${slot.anchor.longitude}`;

export function useMealSuggestions(dayPlaces: Places[]) {
  const slots = useMemo(() => mealSlots(dayPlaces), [dayPlaces]);
  const [optionsByKey, setOptionsByKey] = useState<Record<string, NearbyPlace[]>>({});
  const requested = useRef(new Set<string>());

  useEffect(() => {
    slots.forEach((slot) => {
      const key = slotKey(slot);
      if (requested.current.has(key)) return;
      requested.current.add(key);
      placesService
        .nearby(slot.anchor.latitude, slot.anchor.longitude, {
          radius: RADIUS_METERS,
          limit: OPTIONS_PER_MEAL,
          category: slot.meal.category,
        })
        .catch(() => [] as NearbyPlace[])
        .then((options) => setOptionsByKey((prev) => ({ ...prev, [key]: options })));
    });
  }, [slots]);

  return useMemo<MealSuggestion[]>(
    () => slots.map((slot) => ({ ...slot, key: slotKey(slot), options: optionsByKey[slotKey(slot)] ?? null })),
    [slots, optionsByKey],
  );
}
