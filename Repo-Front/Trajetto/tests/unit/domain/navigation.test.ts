import {
  distanceMeters, formatDuration, googleMapsUrl, legOrigin, LIVE_MAX_DISTANCE, optionFor, remainingOf,
} from '@/src/domain/navigation/navigation';
import { DirectionsOption } from '@/services';

const paradas = [
  { name: 'Fontana di Trevi', latitude: 41.9009, longitude: 12.4833 },
  { name: 'Pantheon', latitude: 41.8986, longitude: 12.4769 },
];
const partida = { lat: 41.9, lng: 12.47 };
const opcao = (mode: 'WALK' | 'CAR' | 'TRANSIT', distance: number, duration: number): DirectionsOption =>
  ({ mode, distance, duration, estimated: false, geometry: null, steps: [] });

describe('navegacao entre paradas', () => {
  it('mede distancias em metros', () => {
    expect(distanceMeters({ lat: 41.9009, lng: 12.4833 }, { lat: 41.8986, lng: 12.4769 })).toBeCloseTo(586, -1);
    expect(distanceMeters(partida, partida)).toBe(0);
  });

  it('parte da posicao atual quando a pessoa esta perto da parada', () => {
    expect(legOrigin(1, paradas, { latitude: 41.9, longitude: 12.48 }, partida)).toEqual(
      { coord: { lat: 41.9, lng: 12.48 }, live: true, kind: 'you' },
    );
  });

  it('longe da cidade, parte da parada anterior ou do ponto de partida do roteiro', () => {
    const longe = { latitude: -25.43, longitude: -49.27 };
    expect(distanceMeters({ lat: longe.latitude, lng: longe.longitude }, partida)).toBeGreaterThan(LIVE_MAX_DISTANCE);
    expect(legOrigin(1, paradas, longe, partida)).toEqual(
      { coord: { lat: 41.9009, lng: 12.4833 }, live: false, kind: 'stop', name: 'Fontana di Trevi' },
    );
    expect(legOrigin(0, paradas, null, partida)).toEqual({ coord: partida, live: false, kind: 'origin' });
    expect(legOrigin(0, paradas, null, null)).toBeNull();
    expect(legOrigin(5, paradas, null, partida)).toBeNull();
  });

  it('o que falta encolhe na mesma proporcao da distancia ate a parada', () => {
    const a = opcao('WALK', 1000, 600);
    expect(remainingOf(a, 800, 400)).toEqual({ distance: 500, duration: 300 });
    expect(remainingOf(a, 800, 1600)).toEqual({ distance: 1000, duration: 600 });
    expect(remainingOf(a, 800, null)).toEqual({ distance: 1000, duration: 600 });
    expect(remainingOf(a, 0, 100)).toEqual({ distance: 1000, duration: 600 });
  });

  it('monta o link do Google Maps no modo escolhido', () => {
    expect(googleMapsUrl({ lat: 1, lng: 2 }, { lat: 3, lng: 4 }, 'TRANSIT'))
      .toBe('https://www.google.com/maps/dir/?api=1&origin=1,2&destination=3,4&travelmode=transit');
    expect(googleMapsUrl({ lat: 1, lng: 2 }, { lat: 3, lng: 4 }, 'CAR')).toContain('travelmode=driving');
  });

  it('formata duracoes curtas e longas', () => {
    expect(formatDuration(20)).toBe('< 1 min');
    expect(formatDuration(720)).toBe('12 min');
    expect(formatDuration(3900)).toBe('1 h 05 min');
  });

  it('escolhe a opcao do modo, inclusive quando nao ha transporte publico', () => {
    const d = { walking: opcao('WALK', 1, 1), driving: opcao('CAR', 2, 2), transit: null };
    expect(optionFor('WALK', d)?.mode).toBe('WALK');
    expect(optionFor('CAR', d)?.mode).toBe('CAR');
    expect(optionFor('TRANSIT', d)).toBeNull();
  });
});
