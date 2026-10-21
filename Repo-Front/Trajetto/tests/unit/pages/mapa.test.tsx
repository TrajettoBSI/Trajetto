import React from 'react';
import polyline from '@mapbox/polyline';
import { Linking } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import Mapa from '@/src/pages/tabs/mapa/Mapa';
import { ItineraryService, placesService, RouteService } from '@/services';
import { Itinerary, useItineraryStore } from '@/hooks/itineraryStore';
import { mockRouter } from '../../mocks/expoRouter';
import { networkError } from '../../helpers';

jest.mock('@/src/pages/tabs/mapa/components/AnimatedDashedPolyline/AnimatedDashedPolyline', () => () => null);
const mockAuth = { user: { id: 1 } };
jest.mock('@/context/AuthContext', () => ({ useAuth: () => mockAuth }));
jest.mock('@/services', () => ({
  ItineraryService: { getItinerary: jest.fn() },
  placesService: { getAll: jest.fn(), getCategories: jest.fn(), getProfiles: jest.fn() },
  RouteService: { getRoute: jest.fn(), getDirections: jest.fn() },
}));

const itin = ItineraryService as unknown as Record<string, jest.Mock>;
const places = placesService as unknown as Record<string, jest.Mock>;
const rotas = RouteService as unknown as Record<string, jest.Mock>;

const parada = (orderIndex: number, name: string, time: string, visitDate: string) => ({
  name, address: '', latitude: 41.9 + orderIndex / 100, longitude: 12.48, estimatedVisitTime: time, orderIndex, visitDate,
});

const roteiro: Itinerary = {
  id: 7, active: true, startDate: '2000-01-01', endDate: '2000-01-02', originLatitude: 41.9, originLongitude: 12.47,
  places: [
    parada(0, 'Fontana di Trevi', '09:00:00', '2000-01-01'),
    parada(1, 'Pantheon', '12:00:00', '2000-01-01'),
    parada(2, 'Colosseo', '09:00:00', '2000-01-02'),
    parada(3, 'Foro', '12:00:00', '2000-01-02'),
  ],
};

const coliseu = {
  name: 'Colosseo', address: 'Piazza del Colosseo', latitude: 41.89, longitude: 12.49, category: 'attraction', fee: 'yes',
  openingHours: 'Jan 01-Dec 31: 00:00-23:59', profiles: [],
};

beforeEach(() => {
  jest.clearAllMocks();
  places.getCategories.mockResolvedValue(['museum']);
  places.getProfiles.mockResolvedValue(['CULTURAL']);
  rotas.getRoute.mockResolvedValueOnce({ geometry: polyline.encode([[41.9, 12.47], [41.91, 12.48]]) }).mockRejectedValue(networkError());
  useItineraryStore.setState({
    itinerary: roteiro, itineraries: [roteiro], loading: false, error: null, selectedDay: null, focusedMapPlaceIndex: null,
  });
});

describe('mapa do roteiro', () => {
  it('abre no dia certo, calcula os trechos e troca de dia', async () => {
    await render(<Mapa />);

    expect(screen.getByText(/Colosseo/)).toBeTruthy();
    expect(screen.getAllByText('visitado ✓').length).toBe(2);
    await waitFor(() => expect(rotas.getRoute).toHaveBeenCalledTimes(1));
    expect(rotas.getRoute.mock.calls[0][0].waypoints.length).toBeGreaterThan(0);

    await fireEvent.press(screen.getByText('Dia 1'));
    expect(await screen.findByText(/Fontana di Tre…/)).toBeTruthy();
    expect(screen.queryByText(/Colosseo/)).toBeNull();

    await fireEvent.press(screen.getByText(/Fontana di Tre…/));
    expect(mockRouter.push).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/SpotDetailScreen' }));
  });

  it('centraliza na parada escolhida no itinerario', async () => {
    useItineraryStore.setState({ focusedMapPlaceIndex: 1 });
    await render(<Mapa />);

    await waitFor(() => expect(useItineraryStore.getState().focusedMapPlaceIndex).toBeNull(), { timeout: 2000 });
  });

  it('busca um lugar, mostra o cartao e abre o detalhe completo', async () => {
    places.getAll.mockResolvedValue([coliseu]);
    await render(<Mapa />);

    await fireEvent.changeText(screen.getByPlaceholderText('Buscar ponto turístico...'), 'Colo');
    await fireEvent.press(await screen.findByText('Colosseo', {}, { timeout: 2000 }));
    expect(screen.getByText('💰 Pago')).toBeTruthy();
    expect(screen.getByText(/Aberto até 23:59/)).toBeTruthy();

    await fireEvent.press(screen.getByText('Ver detalhes completos →'));
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/SpotDetailScreen', params: { spot: JSON.stringify(coliseu), origin: 'mapa' } });

    await fireEvent.press(screen.getAllByText('✕')[0]);
    expect(screen.queryByText('Ver detalhes completos →')).toBeNull();
  });

  it('aplica filtros, mostra os chips, remove um a um e limpa tudo', async () => {
    places.getAll.mockResolvedValue([coliseu]);
    await render(<Mapa />);
    await fireEvent.changeText(screen.getByPlaceholderText('Buscar ponto turístico...'), 'Colo');
    await screen.findByText('Colosseo', {}, { timeout: 2000 });

    await fireEvent.press(screen.getByLabelText('Filtros'));
    await fireEvent.press(await screen.findByText('🏛️ Museu'));
    await fireEvent.press(screen.getByText('Explorador Cultural'));
    await fireEvent.press(screen.getAllByText('🆓 Gratuito')[0]);
    await fireEvent.press(screen.getByText('500 m'));
    await fireEvent(screen.getByRole('switch'), 'valueChange', true);
    await fireEvent.press(screen.getByText('Aplicar filtros'));

    await waitFor(() => expect(places.getAll).toHaveBeenLastCalledWith(expect.objectContaining({
      search: 'Colo', category: 'museum', fee: 'no', hasHours: true, profile: 'CULTURAL', maxDistance: 500,
    })));
    expect(screen.getByText('📍 Museu')).toBeTruthy();
    expect(screen.getByText('📏 500 m')).toBeTruthy();

    const fecharChips = () => screen.getAllByText('✕');
    for (let i = 0; i < 4; i++) await fireEvent.press(fecharChips().at(-1)!);
    expect(screen.queryByText('📏 500 m')).toBeNull();
    expect(screen.getByText('📍 Museu')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Filtros'));
    await fireEvent.press(screen.getByText('Limpar tudo'));
    await waitFor(() => expect(screen.queryByText('📍 Museu')).toBeNull());
    await fireEvent.press(screen.getByLabelText('Filtros'));
    await fireEvent.press(screen.getByText('Cancelar'));
  });

  it('sem roteiro busca o ativo e mostra o convite sobre o mapa', async () => {
    itin.getItinerary.mockResolvedValue('');
    useItineraryStore.setState({ itinerary: null, itineraries: [] });
    await render(<Mapa />);

    expect(await screen.findByText('Criar Roteiro')).toBeTruthy();
    expect(itin.getItinerary).toHaveBeenCalledWith(1);
  });

  describe('navegacao pelo dia', () => {
    const opcao = (mode: string, distance: number, duration: number, extra = {}) => ({
      mode, distance, duration, estimated: false, geometry: polyline.encode([[41.9, 12.47], [41.91, 12.48]]), steps: [], ...extra,
    });
    const trecho = {
      walking: opcao('WALK', 2400, 1800, { steps: [
        { instruction: 'Siga para o norte na Via del Corso', distance: 300, duration: 216 },
        { instruction: 'Chegue ao destino', distance: 0, duration: 0 },
      ] }),
      driving: opcao('CAR', 3000, 480),
      transit: opcao('TRANSIT', 3000, 1200, { estimated: true, geometry: null }),
      recommended: 'TRANSIT',
    };

    it('inicia na proxima parada, mostra os modos com o recomendado e avanca ate concluir o dia', async () => {
      rotas.getDirections.mockResolvedValue(trecho);
      const abrir = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
      await render(<Mapa />);

      await fireEvent.press(screen.getByText('Iniciar'));
      expect(await screen.findByText('Parada 1 de 2')).toBeTruthy();
      expect(screen.getByText('Saindo de: sua localização')).toBeTruthy();
      expect(rotas.getDirections).toHaveBeenCalledWith(
        { lat: 41.9009, lng: 12.4833 }, { lat: 41.92, lng: 12.48 }, 'pt', expect.any(Number),
      );
      expect(screen.getByText('Melhor')).toBeTruthy();
      expect(screen.getByText('~20 min')).toBeTruthy();
      expect(screen.getByText('A pé passa de 20 minutos: metrô ou ônibus compensa.')).toBeTruthy();
      expect(screen.getByText(/Tempo estimado. Toque em "Abrir no Maps"/)).toBeTruthy();

      await fireEvent.press(screen.getByLabelText('A pé'));
      expect(screen.getByText('Siga para o norte na Via del Corso')).toBeTruthy();
      expect(screen.getAllByText('30 min')).toHaveLength(2);

      await fireEvent.press(screen.getByText('Abrir no Maps'));
      expect(abrir).toHaveBeenCalledWith(expect.stringContaining('travelmode=walking'));

      await fireEvent.press(screen.getByText('Cheguei · próxima'));
      expect(await screen.findByText('Parada 2 de 2')).toBeTruthy();
      await fireEvent.press(await screen.findByText('Cheguei · concluir'));
      expect(screen.getByText('Roteiro do dia concluído!')).toBeTruthy();

      await fireEvent.press(screen.getByText('Encerrar'));
      expect(screen.getByText('Iniciar')).toBeTruthy();
    });

    it('longe de Roma parte da parada anterior; com erro deixa tentar de novo', async () => {
      const Location = jest.requireMock('expo-location');
      Location.getCurrentPositionAsync.mockResolvedValueOnce({ coords: { latitude: -25.43, longitude: -49.27 } });
      rotas.getDirections.mockRejectedValueOnce(networkError()).mockResolvedValue({ ...trecho, transit: null, recommended: 'WALK' });
      await render(<Mapa />);

      await fireEvent.press(screen.getByText('Iniciar'));
      expect(await screen.findByText(/Não foi possível conectar/)).toBeTruthy();
      expect(screen.getByText('Saindo de: ponto de partida')).toBeTruthy();

      await fireEvent.press(screen.getByText('Tentar novamente'));
      expect(await screen.findByText('É perto: ir a pé é o mais simples e você aproveita o caminho.')).toBeTruthy();
      expect(screen.queryByLabelText('Metrô/ônibus')).toBeNull();

      await fireEvent.press(screen.getByText('Cheguei · próxima'));
      expect(await screen.findByText('Saindo de: Colosseo')).toBeTruthy();
    });
  });
});
