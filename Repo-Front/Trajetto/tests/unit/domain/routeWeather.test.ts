import { routeSavings } from '@/src/domain/itinerary/routeSavings';
import { weatherKind, WEATHER_ICONS } from '@/src/domain/weather/weatherInfo';

describe('economia da rota', () => {
  it('calcula quanto o 2-opt poupou em relacao a ordem gulosa', () => {
    expect(routeSavings(8, 10)).toEqual({ distanceKm: 8, savedKm: 2, savedPercent: 20 });
  });

  it('sem referencia ou sem ganho, nao inventa economia', () => {
    expect(routeSavings(10, null)).toEqual({ distanceKm: 10, savedKm: 0, savedPercent: 0 });
    expect(routeSavings(10, 9)).toEqual({ distanceKm: 10, savedKm: 0, savedPercent: 0 });
    expect(routeSavings(null, 10)).toBeNull();
  });
});

describe('clima', () => {
  it('traduz os codigos WMO em tipos de tempo com icone', () => {
    expect(weatherKind(0)).toBe('clear');
    expect(weatherKind(2)).toBe('partlyCloudy');
    expect(weatherKind(3)).toBe('cloudy');
    expect(weatherKind(45)).toBe('fog');
    expect(weatherKind(53)).toBe('drizzle');
    expect(weatherKind(63)).toBe('rain');
    expect(weatherKind(81)).toBe('rain');
    expect(weatherKind(75)).toBe('snow');
    expect(weatherKind(95)).toBe('storm');
    expect(weatherKind(10)).toBe('cloudy');
    expect(WEATHER_ICONS.rain).toBe('rainy');
  });
});
