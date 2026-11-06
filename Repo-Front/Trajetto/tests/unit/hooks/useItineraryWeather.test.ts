import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, waitFor } from '@testing-library/react-native';
import { Itinerary } from '@/hooks/itineraryStore';
import { weatherService } from '@/services';
import { isBeyondForecast } from '@/src/domain/weather/weatherInfo';
import { useItineraryWeather } from '@/src/pages/tabs/shared/hooks/useItineraryWeather';

jest.mock('@/services', () => ({
  weatherService: { getForecast: jest.fn() },
}));

const getForecast = weatherService.getForecast as jest.Mock;
const DATE = '2026-11-10';
const day = (maxTemperature: number) => ({
  date: DATE, weatherCode: 0, maxTemperature, minTemperature: 10, precipitationProbability: 0, rainy: false,
});
const trip = (originLatitude: number) =>
  ({ originLatitude, originLongitude: 12.5, startDate: DATE, endDate: DATE }) as unknown as Itinerary;
const keyOf = (latitude: number) => `${latitude.toFixed(2)}|12.50|${DATE}|${DATE}`;

describe('useItineraryWeather', () => {
  beforeEach(async () => {
    getForecast.mockReset();
    await AsyncStorage.clear();
  });

  it('fica carregando ate a previsao chegar e guarda no aparelho', async () => {
    getForecast.mockResolvedValue([day(25)]);
    const { result } = await renderHook(() => useItineraryWeather(trip(1)));

    await waitFor(() => expect(result.current.weatherByDate[DATE]?.maxTemperature).toBe(25));
    expect(result.current.loading).toBe(false);
    await waitFor(async () => {
      const stored = JSON.parse((await AsyncStorage.getItem('itinerary_weather')) ?? '{}');
      expect(stored[keyOf(1)].days[DATE].maxTemperature).toBe(25);
    });
  });

  it('mostra a previsao guardada enquanto busca a nova e depois atualiza', async () => {
    await AsyncStorage.setItem('itinerary_weather', JSON.stringify({ [keyOf(2)]: { at: Date.now(), days: { [DATE]: day(18) } } }));
    let respond: (days: unknown[]) => void = () => {};
    getForecast.mockReturnValue(new Promise((resolve) => { respond = resolve; }));
    const { result } = await renderHook(() => useItineraryWeather(trip(2)));

    await waitFor(() => expect(result.current.weatherByDate[DATE]?.maxTemperature).toBe(18));
    expect(result.current.loading).toBe(false);

    respond([day(30)]);
    await waitFor(() => expect(result.current.weatherByDate[DATE]?.maxTemperature).toBe(30));
  });

  it('ignora a previsao guardada ha mais de um dia', async () => {
    const old = Date.now() - 25 * 60 * 60 * 1000;
    await AsyncStorage.setItem('itinerary_weather', JSON.stringify({ [keyOf(3)]: { at: old, days: { [DATE]: day(18) } } }));
    getForecast.mockRejectedValue(new Error('offline'));
    const { result } = await renderHook(() => useItineraryWeather(trip(3)));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.weatherByDate[DATE]).toBeUndefined();
  });

  it('para de carregar e mantem a previsao guardada quando a busca falha', async () => {
    await AsyncStorage.setItem('itinerary_weather', JSON.stringify({ [keyOf(4)]: { at: Date.now(), days: { [DATE]: day(18) } } }));
    getForecast.mockRejectedValue(new Error('offline'));
    const { result } = await renderHook(() => useItineraryWeather(trip(4)));

    await waitFor(() => expect(result.current.weatherByDate[DATE]?.maxTemperature).toBe(18));
    expect(result.current.loading).toBe(false);
  });
});

describe('isBeyondForecast', () => {
  const today = new Date(2026, 10, 6);

  it('considera 16 dias a partir de hoje', () => {
    expect(isBeyondForecast('2026-11-21', today)).toBe(false);
    expect(isBeyondForecast('2026-11-22', today)).toBe(true);
  });
});
