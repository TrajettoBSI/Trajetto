import React from 'react';
import { Alert, Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import Itinerario from '@/src/pages/tabs/itinerario/Itinerario';
import { ItineraryService, placesService } from '@/services';
import { Itinerary, useItineraryStore } from '@/hooks/itineraryStore';
import { mockRouter } from '../../mocks/expoRouter';
import { apiError, networkError } from '../../helpers';

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, firstName: 'Ana', travelerProfile: 'CULTURAL' } }),
}));
jest.mock('@/services', () => ({
  ItineraryService: { getAllItineraries: jest.fn(), replacePlace: jest.fn(), updateNote: jest.fn() },
  placesService: { getAll: jest.fn(), nearby: jest.fn() },
}));
jest.mock('expo-print', () => ({ printToFileAsync: jest.fn() }));
jest.mock('expo-sharing', () => ({ shareAsync: jest.fn() }));
jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(async () => 'base64'),
  writeAsStringAsync: jest.fn(),
  StorageAccessFramework: {
    requestDirectoryPermissionsAsync: jest.fn(async () => ({ granted: true, directoryUri: 'dir' })),
    createFileAsync: jest.fn(async () => 'novo-arquivo'),
  },
}));

const svc = ItineraryService as unknown as Record<string, jest.Mock>;
const places = placesService as unknown as Record<string, jest.Mock>;

const parada = (orderIndex: number, name: string, time: string, visitDate: string, extra = {}) => ({
  name, address: `${name}, Roma`, latitude: 41.9, longitude: 12.48, estimatedVisitTime: time, orderIndex, visitDate,
  category: 'attraction', fee: 'no', openingHours: 'Mo-Su 09:00-18:00', ...extra,
});

const roteiro: Itinerary = {
  id: 7, active: true, startDate: '2099-11-10', endDate: '2099-11-11',
  places: [
    parada(0, 'Fontana di Trevi', '09:00:00', '2099-11-10', { note: 'Jogar uma moeda' }),
    parada(1, 'Pantheon', '12:00:00', '2099-11-10', { fee: 'yes' }),
    parada(2, 'Colosseo', '14:00:00', '2099-11-10'),
    parada(3, 'Piazza Navona', '21:00:00', '2099-11-10'),
    parada(4, 'Musei Vaticani', '09:00:00', '2099-11-11', { category: 'museum' }),
    parada(5, 'Castel Sant\'Angelo', '12:00:00', '2099-11-11'),
  ],
};

const cafe = { name: 'Tazza d\'Oro', address: 'Via degli Orfani', latitude: 41.9, longitude: 12.47, category: 'cafe', distanceMeters: 230 };

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  places.nearby.mockResolvedValue([cafe]);
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
});
