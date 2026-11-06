import type { Itinerary, Places } from '@/hooks/itineraryStore';

export type SuggestionKey =
  | 'rain' | 'longDay' | 'dominant' | 'paid' | 'allowPaid'
  | 'calmer' | 'nature' | 'nightlife' | 'history' | 'lessChurches';

export type AssistantSuggestion = {
  key: SuggestionKey;
  /** Quantos km tem o dia (longDay), quantas paradas pagas (paid) ou da categoria (dominant). */
  count?: number;
  total?: number;
  km?: number;
  category?: string;
};

const MAX_SUGGESTIONS = 4;
/** A partir daqui, em km entre as paradas, o dia ja pesa para quem anda: equivale a 2h a pe. */
export const LONG_DAY_KM = 8;
const DOMINANT_MIN = 3;
const DOMINANT_SHARE = 0.4;
const PAID_MIN = 3;

/** Lugares ao ar livre: a mesma lista do planejador do backend. */
const OUTDOOR = new Set([
  'park', 'garden', 'viewpoint', 'beach', 'peak', 'nature_reserve', 'zoo', 'theme_park',
  'historic_archaeological_site', 'historic_ruins', 'historic_citywalls', 'historic_aqueduct',
  'artwork', 'waterfall',
]);
const NATURE = new Set(['park', 'garden', 'nature_reserve', 'viewpoint', 'peak', 'beach']);
const NIGHTLIFE = new Set(['bar', 'pub']);

const has = (places: Places[], categories: Set<string>) =>
  places.some((place) => place.category != null && categories.has(place.category));

/** A categoria que mais aparece no roteiro, sem contar "atracoes", que nao diz nada de especifico. */
function dominantCategory(places: Places[]): { category: string; count: number } | null {
  const counts = new Map<string, number>();
  places.forEach((place) => {
    if (place.category && place.category !== 'attraction') {
      counts.set(place.category, (counts.get(place.category) ?? 0) + 1);
    }
  });
  let top: { category: string; count: number } | null = null;
  counts.forEach((count, category) => {
    if (!top || count > top.count) top = { category, count };
  });
  return top;
}

/**
 * O que vale sugerir para este roteiro, do mais urgente para o mais geral: a chuva e o dia puxado
 * do dia que o viajante esta vendo, o que pesa na viagem toda e, para completar, o que falta nela.
 * Nunca sugere o que ja foi pedido.
 */
export function assistantSuggestions(
  itinerary: Itinerary,
  dayPlaces: Places[],
  dayIsRainy: boolean,
): AssistantSuggestion[] {
  const places = itinerary.places ?? [];
  const prefs = itinerary.preferences;
  const more = new Set(prefs?.moreCategories ?? []);
  const less = new Set(prefs?.lessCategories ?? []);
  const asked = (categories: Iterable<string>) => [...categories].some((c) => more.has(c) || less.has(c));
  const suggestions: AssistantSuggestion[] = [];

  if (dayIsRainy && has(dayPlaces, OUTDOOR) && !more.has('museum')) suggestions.push({ key: 'rain' });

  const dayKm = dayPlaces.reduce((sum, place) => sum + (place.distanceFromPreviousKm ?? 0), 0);
  if (dayKm >= LONG_DAY_KM && prefs?.walking !== 'MENOS') suggestions.push({ key: 'longDay', km: Math.round(dayKm) });

  const dominant = dominantCategory(places);
  if (dominant && dominant.count >= DOMINANT_MIN && dominant.count >= places.length * DOMINANT_SHARE
    && !asked([dominant.category])) {
    suggestions.push({ key: 'dominant', count: dominant.count, total: places.length, category: dominant.category });
  }

  const paid = places.filter((place) => place.fee === 'yes').length;
  if (prefs?.avoidPaid) suggestions.push({ key: 'allowPaid' });
  else if (paid >= PAID_MIN) suggestions.push({ key: 'paid', count: paid });

  if (itinerary.pace !== 'LEVE') suggestions.push({ key: 'calmer' });

  if (!has(places, NATURE) && !asked(NATURE)) suggestions.push({ key: 'nature' });
  if (!has(places, NIGHTLIFE) && !asked(NIGHTLIFE)) suggestions.push({ key: 'nightlife' });
  if (!places.some((place) => place.category?.startsWith('historic'))) suggestions.push({ key: 'history' });
  if (places.some((place) => place.category === 'historic_church') && !less.has('historic_church')) {
    suggestions.push({ key: 'lessChurches' });
  }

  return suggestions.slice(0, MAX_SUGGESTIONS);
}
