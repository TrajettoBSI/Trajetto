export type RouteSavings = {
  distanceKm: number;
  savedKm: number;
  savedPercent: number;
};

export function routeSavings(distanceKm?: number | null, baselineKm?: number | null): RouteSavings | null {
  if (distanceKm == null) return null;
  if (baselineKm == null || baselineKm <= 0 || distanceKm >= baselineKm) {
    return { distanceKm, savedKm: 0, savedPercent: 0 };
  }
  const savedKm = baselineKm - distanceKm;
  return { distanceKm, savedKm, savedPercent: Math.round((savedKm / baselineKm) * 100) };
}
