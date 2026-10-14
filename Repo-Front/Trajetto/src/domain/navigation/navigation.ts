import type { Coordinate, DirectionsOption, TravelMode } from '@/services';

export type NavPoint = { name: string; latitude: number; longitude: number };

export type LegOrigin = {
  coord: Coordinate;
  /** De onde o usuario esta agora (GPS), e nao de uma parada do roteiro. */
  live: boolean;
  kind: 'you' | 'origin' | 'stop';
  name?: string;
};

/** Acima desta distancia ate a parada, o GPS nao serve de partida: a pessoa ainda nao esta na cidade. */
export const LIVE_MAX_DISTANCE = 30_000;

export function distanceMeters(a: Coordinate, b: Coordinate): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

const toCoord = (p: { latitude: number; longitude: number }): Coordinate => ({ lat: p.latitude, lng: p.longitude });

/**
 * De onde parte o trecho ate a parada {@code legIndex}: da posicao atual, se a pessoa esta perto;
 * senao da parada anterior, ou do ponto de partida do roteiro quando e a primeira do dia.
 */
export function legOrigin(
  legIndex: number,
  points: NavPoint[],
  user: { latitude: number; longitude: number } | null,
  start: Coordinate | null,
): LegOrigin | null {
  const dest = points[legIndex];
  if (!dest) return null;
  if (user && distanceMeters(toCoord(user), toCoord(dest)) <= LIVE_MAX_DISTANCE) {
    return { coord: toCoord(user), live: true, kind: 'you' };
  }
  if (legIndex > 0) {
    const prev = points[legIndex - 1];
    return { coord: toCoord(prev), live: false, kind: 'stop', name: prev.name };
  }
  return start ? { coord: start, live: false, kind: 'origin' } : null;
}

/**
 * Quanto falta do trecho. Na navegacao ao vivo, a distancia e o tempo da rota encolhem na mesma
 * proporcao que a distancia em linha reta ate a parada.
 */
export function remainingOf(option: DirectionsOption, straightAtStart: number, straightNow: number | null) {
  if (straightNow == null || straightAtStart <= 0) return { distance: option.distance, duration: option.duration };
  const fraction = Math.min(1, straightNow / straightAtStart);
  return { distance: option.distance * fraction, duration: option.duration * fraction };
}

const GOOGLE_MODE: Record<TravelMode, string> = { WALK: 'walking', CAR: 'driving', TRANSIT: 'transit' };

/** Abre o trecho no Google Maps (app ou site), que tem as linhas e horarios do transporte publico. */
export function googleMapsUrl(origin: Coordinate, dest: Coordinate, mode: TravelMode): string {
  return 'https://www.google.com/maps/dir/?api=1'
    + `&origin=${origin.lat},${origin.lng}`
    + `&destination=${dest.lat},${dest.lng}`
    + `&travelmode=${GOOGLE_MODE[mode]}`;
}

/** Duracao curta para a tela: "< 1 min", "12 min", "1 h 05 min". */
export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min`;
}

export function optionFor(mode: TravelMode, d: { walking: DirectionsOption; driving: DirectionsOption; transit: DirectionsOption | null }) {
  if (mode === 'WALK') return d.walking;
  if (mode === 'CAR') return d.driving;
  return d.transit;
}
