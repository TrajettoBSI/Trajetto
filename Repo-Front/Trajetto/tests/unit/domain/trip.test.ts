import { dayKm, haversineKm, tripStats } from '@/src/domain/trip/tripStats';
import { FIRST_TRIP_BY_PROFILE, firstTripBySlug, firstTripFor } from '@/src/domain/trip/firstTrip';

const DIA1 = '2026-11-10';
const DIA2 = '2026-11-11';

const parada = (orderIndex: number, visitDate: string, estimatedVisitTime: string, extra: object = {}) => ({
  orderIndex, visitDate, estimatedVisitTime, latitude: 41.9 + orderIndex / 100, longitude: 12.48, ...extra,
});

describe('numeros do roteiro para o cartao de compartilhar', () => {
  const viagem = {
    startDate: DIA1,
    endDate: DIA2,
    originLatitude: 41.9,
    originLongitude: 12.48,
    places: [
      parada(0, DIA1, '09:00', { category: 'museum', distanceFromPreviousKm: 1.2 }),
      parada(1, DIA1, '11:00', { category: 'museum', distanceFromPreviousKm: 0.8 }),
      parada(2, DIA1, '14:00', { category: 'park', distanceFromPreviousKm: 2 }),
      parada(3, DIA2, '10:00', { category: 'viewpoint', distanceFromPreviousKm: 1 }),
    ],
  };

  it('soma os km de cada dia e conta paradas e dias', () => {
    const stats = tripStats(viagem);

    expect(stats.days).toBe(2);
    expect(stats.stops).toBe(4);
    expect(stats.km).toBeCloseTo(5);
    expect(stats.perDay.map((d) => d.km)).toEqual([4, 1]);
    expect(stats.perDay[0].stops.map((p) => p.orderIndex)).toEqual([0, 1, 2]);
  });

  it('ordena as categorias pela quantidade', () => {
    expect(tripStats(viagem).categories).toEqual([
      { category: 'museum', count: 2 },
      { category: 'park', count: 1 },
      { category: 'viewpoint', count: 1 },
    ]);
  });

  it('sem distancia do backend, usa a linha reta desde a partida e entre as paradas', () => {
    const a = parada(0, DIA1, '09:00');
    const b = parada(1, DIA1, '10:00');
    const origem = { latitude: 41.89, longitude: 12.48 };

    expect(dayKm([b, a], origem)).toBeCloseTo(
      haversineKm(41.89, 12.48, a.latitude, a.longitude) + haversineKm(a.latitude, a.longitude, b.latitude, b.longitude));
    expect(haversineKm(41.9, 12.48, 41.91, 12.48)).toBeCloseTo(1.11, 1);
  });

  it('roteiro vazio nao quebra', () => {
    expect(tripStats({ startDate: DIA1, places: [] })).toMatchObject({ days: 0, stops: 0, km: 0, categories: [] });
  });
});

describe('primeira viagem por perfil', () => {
  it('cada perfil tem uma cidade do catalogo; sem perfil conhecido, Roma', () => {
    expect(Object.keys(FIRST_TRIP_BY_PROFILE)).toHaveLength(8);
    expect(firstTripFor('NATUREZA').slug).toBe('rio-de-janeiro');
    expect(firstTripFor('SKIPPED').slug).toBe('roma');
    expect(firstTripFor(null).slug).toBe('roma');
  });

  it('acha a cidade pelo slug', () => {
    expect(firstTripBySlug('kyoto')?.latitude).toBeCloseTo(35.0116);
    expect(firstTripBySlug('atlantida')).toBeNull();
    expect(firstTripBySlug(undefined)).toBeNull();
  });
});
