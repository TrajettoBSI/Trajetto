import React from 'react';
import { Linking } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import TravelMode from '@/src/pages/travelMode/TravelMode';
import { weatherService } from '@/services';
import { Itinerary, useItineraryStore } from '@/hooks/itineraryStore';
import { mockRouter } from '../../mocks/expoRouter';

jest.mock('@/services', () => ({
  placesService: { getImage: jest.fn(async () => null) },
  weatherService: { getForecast: jest.fn(async () => []) },
}));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(async () => undefined),
  NotificationFeedbackType: { Success: 'success' },
}));

const weather = weatherService as unknown as Record<string, jest.Mock>;

const parada = (orderIndex: number, name: string, time: string, visitDate: string, extra = {}) => ({
  name, address: `${name}, Roma`, latitude: 41.9 + orderIndex / 100, longitude: 12.48, estimatedVisitTime: time,
  orderIndex, visitDate, category: 'attraction', ...extra,
});

const roteiro = (start: string, end: string): Itinerary => ({
  id: 7, active: true, startDate: start, endDate: end, city: 'roma', originLatitude: 41.89, originLongitude: 12.48,
  places: [
    parada(0, 'Fontana di Trevi', '09:00:00', start, { note: 'Levar moedas' }),
    parada(1, 'Pantheon', '11:00:00', start),
    parada(2, 'Colosseo', '14:00:00', start),
    parada(3, 'Musei Vaticani', '10:00:00', end),
  ],
});

const usar = (itinerary: Itinerary | null) => useItineraryStore.setState({
  itinerary, itineraries: itinerary ? [itinerary] : [], selectedDay: null, focusedMapPlaceIndex: null,
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
});

describe('modo viagem', () => {
  it('antes da viagem, simula o dia: avanca o relogio, pula para a proxima parada e conclui', async () => {
    weather.getForecast.mockResolvedValue([
      { date: '2099-11-10', weatherCode: 1, maxTemperature: 22.4, minTemperature: 12, precipitationProbability: 5, rainy: false },
    ]);
    usar(roteiro('2099-11-10', '2099-11-11'));
    await render(<TravelMode />);

    expect(screen.getByText(/Sua viagem começa em/)).toBeTruthy();
    expect(screen.getByText('Simulação - 08:40')).toBeTruthy();
    expect(screen.getByText('Próxima parada em 20 min')).toBeTruthy();
    expect(screen.getAllByText('Fontana di Trevi').length).toBeGreaterThan(0);
    expect(screen.getByText('Levar moedas')).toBeTruthy();
    expect(screen.getByText('0 de 3 paradas')).toBeTruthy();
    expect(await screen.findByText('22°')).toBeTruthy();

    await fireEvent.press(screen.getByText('+30 min'));
    expect(screen.getByText('Agora')).toBeTruthy();
    expect(screen.getByText('Simulação - 09:10')).toBeTruthy();
    await fireEvent.press(screen.getByText('-30 min'));
    expect(screen.getByText('Simulação - 08:40')).toBeTruthy();

    await fireEvent.press(screen.getByText('Próxima parada'));
    expect(screen.getByText('Agora')).toBeTruthy();
    expect(screen.getAllByText('Fontana di Trevi').length).toBeGreaterThan(0);

    await fireEvent.press(screen.getByText('Concluir'));
    expect(screen.getByText('1 de 3 paradas')).toBeTruthy();
    expect(screen.getByText(/Próxima parada em 1h/)).toBeTruthy();

    await fireEvent.press(screen.getByText('Como chegar'));
    expect(Linking.openURL).toHaveBeenCalledWith(expect.stringContaining('destination=41.91,12.48&travelmode=walking'));

    await fireEvent.press(screen.getByText('No mapa'));
    expect(useItineraryStore.getState().selectedDay).toBe('2099-11-10');
    expect(useItineraryStore.getState().focusedMapPlaceIndex).toBe(1);
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/mapa', params: { from: 'itinerario' } });
  });

  it('o dia termina com a tela de dia concluido, e da para simular o dia seguinte', async () => {
    usar(roteiro('2099-11-10', '2099-11-11'));
    await render(<TravelMode />);

    for (let i = 0; i < 3; i++) await fireEvent.press(screen.getByText('Concluir'));
    expect(screen.getByText('Dia concluído!')).toBeTruthy();
    expect(screen.getByText('100%')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Dia seguinte'));
    expect(screen.getByText(/Dia 2 de 2/)).toBeTruthy();
    expect(screen.getAllByText('Musei Vaticani').length).toBeGreaterThan(0);
    expect(screen.getByText('0 de 1 paradas')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Dia anterior'));
    expect(screen.getByText(/Dia 1 de 2/)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Voltar'));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('uma viagem que ja terminou pode ser revista', async () => {
    usar(roteiro('2001-03-10', '2001-03-11'));
    await render(<TravelMode />);

    expect(screen.getByText('Esta viagem já terminou. Reveja como foi:')).toBeTruthy();
    expect(screen.getByText(/Dia 1 de 2/)).toBeTruthy();
  });

  it('sem roteiro ativo, convida a criar um', async () => {
    usar(null);
    await render(<TravelMode />);

    expect(screen.getByText('Modo viagem')).toBeTruthy();
  });
});
