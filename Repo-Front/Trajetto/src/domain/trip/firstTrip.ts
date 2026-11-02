/** Cidade do catalogo sugerida para o primeiro roteiro de cada perfil de viajante. */
export type FirstTrip = {
  slug: string;
  latitude: number;
  longitude: number;
};

const ROMA: FirstTrip = { slug: 'roma', latitude: 41.9028, longitude: 12.4964 };

export const FIRST_TRIP_BY_PROFILE: Record<string, FirstTrip> = {
  AVENTUREIRO: { slug: 'cidade-do-cabo', latitude: -33.9249, longitude: 18.4241 },
  CULTURAL: ROMA,
  NATUREZA: { slug: 'rio-de-janeiro', latitude: -22.9068, longitude: -43.1729 },
  LUXO: { slug: 'dubai', latitude: 25.18, longitude: 55.24 },
  MOCHILEIRO: { slug: 'lisboa', latitude: 38.7223, longitude: -9.1393 },
  RELAXAMENTO: { slug: 'florenca', latitude: 43.7696, longitude: 11.2558 },
  SOCIAL: { slug: 'barcelona', latitude: 41.3874, longitude: 2.1686 },
  SOLITARIO: { slug: 'kyoto', latitude: 35.0116, longitude: 135.7681 },
};

export function firstTripFor(profile?: string | null): FirstTrip {
  return (profile && FIRST_TRIP_BY_PROFILE[profile]) || ROMA;
}

export function firstTripBySlug(slug?: string | null): FirstTrip | null {
  if (!slug) return null;
  return Object.values(FIRST_TRIP_BY_PROFILE).find((trip) => trip.slug === slug) ?? null;
}
