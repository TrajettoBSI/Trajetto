import React from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import Itinerario from '@/src/pages/tabs/itinerario/Itinerario';
import { favoriteService, ItineraryService, placesService } from '@/services';
import { Itinerary, useItineraryStore } from '@/hooks/itineraryStore';
import { useFavoritesStore } from '@/hooks/favoritesStore';
import { mockRouter } from '../../mocks/expoRouter';
import { apiError, networkError } from '../../helpers';

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, firstName: 'Ana', travelerProfile: 'CULTURAL' } }),
}));
jest.mock('@/services', () => ({
  ItineraryService: {
    getAllItineraries: jest.fn(), replacePlace: jest.fn(), updateNote: jest.fn(),
    addPlace: jest.fn(), removePlace: jest.fn(), movePlace: jest.fn(),
  },
  placesService: { getAll: jest.fn(), nearby: jest.fn() },
  favoriteService: { list: jest.fn() },
}));
jest.mock('expo-print', () => ({ printToFileAsync: jest.fn() }));
jest.mock('expo-sharing', () => ({ shareAsync: jest.fn() }));
jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: jest.fn(async () => 'base64'),
  writeAsStringAsync: jest.fn(),
  StorageAccessFramework: {
    requestDirectoryPermissionsAsync: jest.fn(async () => ({ granted: true, directoryUri: 'dir' })),
    createFileAsync: jest.fn(async () => 'novo-arquivo'),
  },
}));

const svc = ItineraryService as unknown as Record<string, jest.Mock>;
const places = placesService as unknown as Record<string, jest.Mock>;
const fav = favoriteService as unknown as Record<string, jest.Mock>;

const parada = (orderIndex: number, name: string, time: string, visitDate: string, extra = {}) => ({
  name, address: `${name}, Roma`, latitude: 41.9, longitude: 12.48, estimatedVisitTime: time, orderIndex, visitDate,
  category: 'attraction', fee: 'no', openingHours: 'Mo-Su 09:00-18:00', ...extra,
});

const roteiro: Itinerary = {
  id: 7, active: true, startDate: '2099-11-10', endDate: '2099-11-11',
  places: [
    parada(0, 'Fontana di Trevi', '09:00:00', '2099-11-10', { note: 'Jogar uma moeda' }),
    parada(1, 'Pantheon', '12:00:00', '2099-11-10', { fee: 'yes', bookingUrl: 'https://www.pantheonroma.com/' }),
    parada(2, 'Colosseo', '14:00:00', '2099-11-10', { openAtVisit: false }),
    parada(3, 'Piazza Navona', '21:00:00', '2099-11-10', { fee: 'yes', ticketUrl: 'https://www.museodiroma.it/' }),
    parada(4, 'Musei Vaticani', '09:00:00', '2099-11-11', { category: 'museum' }),
    parada(5, 'Castel Sant\'Angelo', '12:00:00', '2099-11-11'),
  ],
};

const cafe = { name: 'Tazza d\'Oro', address: 'Via degli Orfani', latitude: 41.9, longitude: 12.47, category: 'cafe', distanceMeters: 230 };

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  places.nearby.mockResolvedValue([cafe]);
  useFavoritesStore.setState({ ownerId: null, favorites: null, loading: false, error: null });
  useItineraryStore.setState({
    itinerary: roteiro, itineraries: [roteiro], loading: false, error: null, selectedDay: null,
    highlightedPlaceIndex: null, focusedMapPlaceIndex: null,
  });
});

describe('itinerario', () => {
  it('mostra o dia selecionado com paradas, anotacao, refeicoes e troca de dia', async () => {
    await render(<Itinerario />);

    expect(screen.getByText('Fontana di Trevi')).toBeTruthy();
    expect(screen.getByText('Jogar uma moeda')).toBeTruthy();
    expect(screen.getByText('PARADAS DO DIA 1 DE 2')).toBeTruthy();
    expect(await screen.findByText('Café da manhã · 08:00')).toBeTruthy();
    expect((await screen.findAllByText('Tazza d\'Oro')).length).toBe(3);

    await fireEvent.press(screen.getByText('Dia 2'));
    expect(await screen.findByText('Musei Vaticani')).toBeTruthy();
    expect(screen.getByText('Tarde livre')).toBeTruthy();
    expect(screen.queryByText('Fontana di Trevi')).toBeNull();
  });

  it('abre o mapa na parada, o detalhe do lugar e o detalhe de uma sugestao de refeicao', async () => {
    places.getAll.mockResolvedValue([{ ...cafe, name: 'Fontana di Trevi', phone: '123' }]);
    await render(<Itinerario />);

    await fireEvent.press(screen.getByText('Pantheon'));
    expect(useItineraryStore.getState().focusedMapPlaceIndex).toBe(1);
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/mapa', params: { from: 'itinerario' } });

    await fireEvent.press(screen.getAllByText('Sobre')[0]);
    await waitFor(() => expect(mockRouter.push).toHaveBeenLastCalledWith(expect.objectContaining({ pathname: '/SpotDetailScreen' })));
    expect(JSON.parse(mockRouter.push.mock.calls.at(-1)[0].params.spot).phone).toBe('123');

    await fireEvent.press((await screen.findAllByText('Tazza d\'Oro'))[0]);
    expect(mockRouter.push).toHaveBeenLastCalledWith(expect.objectContaining({ pathname: '/SpotDetailScreen' }));
  });

  it('troca uma parada por uma das alternativas sugeridas', async () => {
    const alternativa = { name: 'Galleria Borghese', address: 'Piazzale Scipione Borghese', latitude: 41.91, longitude: 12.49, category: 'attraction', fee: 'no' };
    places.getAll.mockResolvedValue([alternativa]);
    svc.replacePlace.mockResolvedValue({ ...roteiro, places: roteiro.places.map((p) => (p.orderIndex === 0 ? { ...p, name: 'Galleria Borghese' } : p)) });
    await render(<Itinerario />);

    await fireEvent.press(screen.getAllByText('Trocar')[0]);
    expect(await screen.findByText('Substituir "Fontana di Trevi" por:')).toBeTruthy();
    await fireEvent.press(await screen.findByText('Galleria Borghese'));

    await waitFor(() => expect(svc.replacePlace).toHaveBeenCalledWith(7, 0, expect.objectContaining({ name: 'Galleria Borghese', estimatedVisitTime: '09:00:00' })));
    expect(await screen.findByText('Galleria Borghese')).toBeTruthy();
  });

  it('sem alternativas mostra o aviso, cancela, e avisa quando a troca falha', async () => {
    places.getAll.mockResolvedValueOnce([]).mockRejectedValueOnce(networkError())
      .mockResolvedValue([{ name: 'Outro Lugar', address: '', latitude: 41.9, longitude: 12.4, category: 'park' }]);
    svc.replacePlace.mockRejectedValue(apiError(404, 'RESOURCE_NOT_FOUND', 'Parada não encontrada.'));
    await render(<Itinerario />);

    await fireEvent.press(screen.getAllByText('Trocar')[0]);
    expect(await screen.findByText('Nenhuma alternativa encontrada.')).toBeTruthy();
    await fireEvent.press(screen.getByText('Cancelar'));

    await fireEvent.press(screen.getAllByText('Trocar')[0]);
    expect(await screen.findByText('Nenhuma alternativa encontrada.')).toBeTruthy();
    await fireEvent.press(screen.getByText('Cancelar'));

    await fireEvent.press(screen.getAllByText('Trocar')[1]);
    await fireEvent.press(await screen.findByText('Outro Lugar'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Parada não encontrada.', undefined));
  });

  it('registra, edita e remove a anotacao de uma parada', async () => {
    svc.updateNote.mockRejectedValueOnce(networkError()).mockResolvedValue(roteiro);
    await render(<Itinerario />);

    await fireEvent.press(screen.getAllByLabelText('Adicionar anotação')[0]);
    expect(screen.getByText('Anotação da parada')).toBeTruthy();
    await fireEvent.changeText(screen.getByPlaceholderText(/comprar ingresso antes/), 'Comprar ingresso antes');
    expect(screen.getByText('22/1000')).toBeTruthy();

    await fireEvent.press(screen.getByText('Salvar anotação'));
    expect(await screen.findByText(/Não foi possível conectar/)).toBeTruthy();
    await fireEvent.press(screen.getByText('Salvar anotação'));
    await waitFor(() => expect(svc.updateNote).toHaveBeenLastCalledWith(7, 1, 'Comprar ingresso antes'));

    await fireEvent.press(screen.getByLabelText('Editar anotação'));
    await fireEvent.changeText(screen.getByDisplayValue('Jogar uma moeda'), '   ');
    await fireEvent.press(screen.getByText('Salvar anotação'));
    await waitFor(() => expect(svc.updateNote).toHaveBeenLastCalledWith(7, 0, null));

    await fireEvent.press(screen.getAllByLabelText('Adicionar anotação')[0]);
    await fireEvent.press(screen.getAllByText('Cancelar').at(-1)!);
  });

  it('exporta o PDF pelo atalho do cabecalho e pelo botao do fim da lista', async () => {
    (Print.printToFileAsync as jest.Mock).mockResolvedValue({ uri: 'roteiro.pdf' });
    await render(<Itinerario />);

    await fireEvent.press(screen.getByLabelText('Exportar em PDF'));
    await waitFor(() => expect(Sharing.shareAsync).toHaveBeenCalledWith('roteiro.pdf', expect.objectContaining({ mimeType: 'application/pdf' })));
    const html = (Print.printToFileAsync as jest.Mock).mock.calls[0][0].html as string;
    expect(html).toContain('Fontana di Trevi');
    expect(html).toContain('Jogar uma moeda');
    expect(html).toContain('Dia 2');

    (Print.printToFileAsync as jest.Mock).mockRejectedValue(new Error('sem espaco'));
    await fireEvent.press(screen.getAllByText('Exportar em PDF').at(-1)!);
    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('Erro', expect.any(String), undefined));
  });

  it('no Android salva o PDF na pasta escolhida', async () => {
    const original = Platform.OS;
    Object.defineProperty(Platform, 'OS', { get: () => 'android', configurable: true });
    (Print.printToFileAsync as jest.Mock).mockResolvedValue({ uri: 'roteiro.pdf' });
    await render(<Itinerario />);

    await fireEvent.press(screen.getByLabelText('Exportar em PDF'));
    await waitFor(() => expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith('novo-arquivo', 'base64', { encoding: 'base64' }));
    expect(Alert.alert).toHaveBeenCalledWith('Sucesso', 'Roteiro salvo no seu celular!', undefined);
    Object.defineProperty(Platform, 'OS', { get: () => original, configurable: true });
  });

  it('sem roteiro ativo convida a criar um, e com erro permite tentar de novo', async () => {
    useItineraryStore.setState({ itinerary: null, itineraries: [] });
    const { unmount } = await render(<Itinerario />);
    await fireEvent.press(screen.getByText('Criar Roteiro'));
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/', params: { openGenerate: '1' } });
    await unmount();

    svc.getAllItineraries.mockResolvedValue([roteiro]);
    useItineraryStore.setState({ itinerary: null, error: 'Falhou ao carregar' });
    await render(<Itinerario />);
    await fireEvent.press(screen.getByText('Tentar novamente'));
    expect(await screen.findByText('Fontana di Trevi')).toBeTruthy();
  });

  it('avisa da reserva com o link oficial e de parada marcada num horario fechado', async () => {
    const abrir = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await render(<Itinerario />);

    expect(screen.getByText('Fechado neste horário. Troque o horário ou a parada.')).toBeTruthy();
    await fireEvent.press(screen.getByText('Reserve com antecedência no site oficial'));
    expect(abrir).toHaveBeenCalledWith('https://www.pantheonroma.com/');
  });

  it('lugar pago sem reserva leva ao site oficial para o ingresso', async () => {
    const abrir = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await render(<Itinerario />);

    await fireEvent.press(screen.getByText('Ingressos e horários no site oficial'));
    expect(abrir).toHaveBeenCalledWith('https://www.museodiroma.it/');
  });

  it('no modo de edicao muda a ordem, remove com confirmacao e inclui um favorito no dia', async () => {
    fav.list.mockResolvedValue([
      { id: 1, xid: 'osm_galleria_borghese', name: 'Galleria Borghese', address: 'Piazzale', category: 'museum', latitude: 41.91, longitude: 12.49, createdAt: '' },
    ]);
    const trocado = { ...roteiro, places: roteiro.places.map((p) => (p.orderIndex === 0 ? { ...p, name: 'Primeira Nova' } : p)) };
    svc.movePlace.mockResolvedValue(trocado);
    svc.removePlace.mockResolvedValue({ ...roteiro, places: roteiro.places.filter((p) => p.orderIndex !== 1) });
    svc.addPlace.mockRejectedValueOnce(apiError(400, 'INVALID_PARAMETER', 'O dia escolhido está fora do período do roteiro.'))
      .mockResolvedValue({ ...roteiro, places: [...roteiro.places, parada(6, 'Galleria Borghese', '22:00:00', '2099-11-10')] });
    await render(<Itinerario />);

    expect(screen.queryByLabelText('Mover Pantheon para cima')).toBeNull();
    await fireEvent.press(screen.getByText('Editar'));
    expect(screen.getByText(/Use as setas/)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Mover Pantheon para cima'));
    await waitFor(() => expect(svc.movePlace).toHaveBeenCalledWith(7, 1, 'UP'));
    expect(await screen.findByText('Primeira Nova')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Mover Colosseo para baixo'));
    await waitFor(() => expect(svc.movePlace).toHaveBeenLastCalledWith(7, 2, 'DOWN'));

    await fireEvent.press(screen.getByLabelText('Remover Pantheon'));
    const [titulo, , botoes] = (Alert.alert as jest.Mock).mock.calls.at(-1);
    expect(titulo).toBe('Remover parada');
    await act(async () => { await botoes[1].onPress(); });
    await waitFor(() => expect(svc.removePlace).toHaveBeenCalledWith(7, 1));
    await waitFor(() => expect(screen.queryByText('Pantheon')).toBeNull());

    await fireEvent.press(screen.getByText('Adicionar dos favoritos'));
    await fireEvent.press(await screen.findByText('Galleria Borghese'));
    await waitFor(() => expect(Alert.alert).toHaveBeenLastCalledWith('Trajetto', 'O dia escolhido está fora do período do roteiro.', undefined));

    await fireEvent.press(screen.getByText('Adicionar dos favoritos'));
    await fireEvent.press(await screen.findByText('Galleria Borghese'));
    await waitFor(() => expect(svc.addPlace).toHaveBeenLastCalledWith(7, expect.objectContaining({
      xid: 'osm_galleria_borghese', name: 'Galleria Borghese', visitDate: '2099-11-10',
    })));
    expect(await screen.findByText('Galleria Borghese')).toBeTruthy();

    await fireEvent.press(screen.getByText('Concluir'));
    expect(screen.queryByText('Adicionar dos favoritos')).toBeNull();
  });

  it('sem favoritos, a lista avisa que ainda nao ha nenhum', async () => {
    fav.list.mockResolvedValue([]);
    await render(<Itinerario />);

    await fireEvent.press(screen.getByText('Editar'));
    await fireEvent.press(screen.getByText('Adicionar dos favoritos'));
    expect(await screen.findByText('Você ainda não tem lugares favoritos.')).toBeTruthy();
  });
});
