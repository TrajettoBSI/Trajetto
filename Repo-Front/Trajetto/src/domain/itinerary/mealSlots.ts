export type MealId = 'breakfast' | 'lunch' | 'dinner';

export type Meal = {
  id: MealId;
  time: string;
  category: string;
};

export const MEALS: Meal[] = [
  { id: 'breakfast', time: '08:00', category: 'cafe' },
  { id: 'lunch', time: '13:00', category: 'restaurant' },
  { id: 'dinner', time: '19:30', category: 'restaurant' },
];

type TimedPlace = { estimatedVisitTime: string };

export type MealSlot<P extends TimedPlace> = {
  meal: Meal;
  insertAt: number;
  anchor: P;
};

export function mealSlots<P extends TimedPlace>(places: P[]): MealSlot<P>[] {
  if (places.length === 0) return [];
  return MEALS.map((meal) => {
    const insertAt = places.filter((p) => p.estimatedVisitTime.slice(0, 5) < meal.time).length;
    return { meal, insertAt, anchor: places[Math.max(0, insertAt - 1)] };
  });
}
