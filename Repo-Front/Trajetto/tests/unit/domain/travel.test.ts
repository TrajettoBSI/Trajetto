import { haversineKm, simulatedNow, travelProgress, walkingMinutes } from '@/src/domain/travel/travelProgress';
import { routeSavings } from '@/src/domain/itinerary/routeSavings';
import { weatherKind, WEATHER_ICONS } from '@/src/domain/weather/weatherInfo';

const parada = (orderIndex: number, estimatedVisitTime: string, visitDate: string) =>
  ({ orderIndex, estimatedVisitTime, visitDate });

const DIA1 = '2026-11-10';
const DIA2 = '2026-11-11';
const PARADAS = [
  parada(0, '09:00', DIA1), parada(1, '11:00', DIA1), parada(2, '14:00', DIA1),
  parada(3, '10:00', DIA2), parada(4, '15:00', DIA2),
];
const em = (date: string, hh: number, mm = 0) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, hh, mm);
};

describe('modo viagem', () => {
  it('antes da viagem, mostra o primeiro dia e quantos dias faltam', () => {
    const p = travelProgress(DIA1, DIA2, PARADAS, em('2026-11-07', 12));
    expect(p.status).toBe('beforeTrip');
    expect(p.daysUntilTrip).toBe(3);
    expect(p.date).toBe(DIA1);
    expect(p.nextIndex).toBe(0);
  });

  it('cedo no dia, a proxima e a primeira parada, com a contagem regressiva', () => {
    const p = travelProgress(DIA1, DIA2, PARADAS, em(DIA1, 8, 30));
    expect(p.status).toBe('beforeDay');
    expect(p.nextIndex).toBe(0);
    expect(p.minutesToNext).toBe(30);
    expect(p.dayNumber).toBe(1);
    expect(p.totalDays).toBe(2);
  });

  it('durante a visita, a parada e a atual; depois dela, vira concluida', () => {
    const visitando = travelProgress(DIA1, DIA2, PARADAS, em(DIA1, 11, 20));
    expect(visitando.status).toBe('visiting');
    expect(visitando.currentIndex).toBe(1);
    expect(visitando.done).toEqual([true, false, false]);

    const aCaminho = travelProgress(DIA1, DIA2, PARADAS, em(DIA1, 12, 30));
    expect(aCaminho.status).toBe('onTheWay');
    expect(aCaminho.nextIndex).toBe(2);
    expect(aCaminho.doneCount).toBe(2);
  });

  it('concluir uma parada pula para a seguinte antes do horario acabar', () => {
    const p = travelProgress(DIA1, DIA2, PARADAS, em(DIA1, 11, 20), new Set([1]));
    expect(p.currentIndex).toBeNull();
    expect(p.nextIndex).toBe(2);
    expect(p.minutesToNext).toBe(160);
  });

  it('no fim do dia, o dia esta concluido; no segundo dia, as paradas sao as dele', () => {
    expect(travelProgress(DIA1, DIA2, PARADAS, em(DIA1, 20)).status).toBe('dayDone');
    const dia2 = travelProgress(DIA1, DIA2, PARADAS, em(DIA2, 9));
    expect(dia2.dayNumber).toBe(2);
    expect(dia2.stops.map((s) => s.orderIndex)).toEqual([3, 4]);
  });

  it('depois da viagem, tudo concluido', () => {
    const p = travelProgress(DIA1, DIA2, PARADAS, em('2026-12-01', 10));
    expect(p.status).toBe('afterTrip');
    expect(p.doneCount).toBe(2);
  });

  it('o relogio simulado parte do horario da parada com deslocamento', () => {
    const d = simulatedNow(DIA1, '09:00', -20);
    expect(d.getHours()).toBe(8);
    expect(d.getMinutes()).toBe(40);
  });

  it('distancia em linha reta e tempo a pe com o desvio das ruas', () => {
    expect(haversineKm(0, 0, 0, 0.009)).toBeCloseTo(1, 1);
    expect(walkingMinutes(1)).toBe(16);
  });
});

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
