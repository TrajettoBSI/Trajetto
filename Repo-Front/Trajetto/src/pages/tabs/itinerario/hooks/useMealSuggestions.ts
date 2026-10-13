import { useCallback, useEffect, useMemo, useState } from 'react';
import { Places } from '@/hooks/itineraryStore';
import { NearbyPlace, placesService } from '@/services';
import { MealSlot, mealSlots } from '@/src/domain/itinerary/mealSlots';

const RADII_METERS = [1200, 2500];
const OPTIONS_PER_MEAL = 3;

type MealOptions = NearbyPlace[] | 'error';

export type MealSuggestion = MealSlot<Places> & {
  key: string;
  options: NearbyPlace[] | null;
  failed: boolean;
};

const slotKey = (slot: MealSlot<Places>) =>
  `${slot.meal.id}-${slot.anchor.latitude}-${slot.anchor.longitude}`;

async function findMealOptions(slot: MealSlot<Places>): Promise<NearbyPlace[]> {
  for (const radius of RADII_METERS) {
    const options = await placesService.nearby(slot.anchor.latitude, slot.anchor.longitude, {
      radius,
      limit: OPTIONS_PER_MEAL,
      category: slot.meal.category,
    });
    if (options.length > 0) return options;
  }
  return [];
}

export function useMealSuggestions(dayPlaces: Places[]) {
  const slots = useMemo(() => mealSlots(dayPlaces), [dayPlaces]);
  const [optionsByKey, setOptionsByKey] = useState<Record<string, MealOptions>>({});
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    slots.forEach((slot) => {
      const key = slotKey(slot);
      findMealOptions(slot)
        .then((options): MealOptions => options)
        .catch((): MealOptions => 'error')
        .then((result) => {
          if (!cancelled) setOptionsByKey((prev) => ({ ...prev, [key]: result }));
        });
    });
    return () => { cancelled = true; };
  }, [slots, attempt]);

  const retry = useCallback(() => {
    setOptionsByKey({});
    setAttempt((n) => n + 1);
  }, []);

  const suggestions = useMemo<MealSuggestion[]>(
    () => slots.map((slot) => {
      const result = optionsByKey[slotKey(slot)];
      return {
        ...slot,
        key: slotKey(slot),
        options: result === undefined || result === 'error' ? null : result,
        failed: result === 'error',
      };
    }),
    [slots, optionsByKey],
  );

  return { mealSuggestions: suggestions, retryMealSuggestions: retry };
}
