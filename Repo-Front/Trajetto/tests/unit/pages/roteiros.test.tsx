import React from 'react';
import { Alert, AlertButton } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import Roteiros from '@/src/pages/tabs/roteiros/Roteiros';
import GenerateItineraryFlow from '@/components/GenerateItineraryFlow';
import { cityService, ItineraryService, placesService, searchAddresses } from '@/services';
import { Itinerary, useItineraryStore } from '@/hooks/itineraryStore';
import { mockRouter, setMockParams } from '../../mocks/expoRouter';
import { apiError, networkError } from '../../helpers';

let mockUser = { id: 1, firstName: 'Ana', lastName: 'Souza', isAdmin: false };
jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: mockUser }) }));
jest.mock('@/services', () => ({
  ItineraryService: {
    getAllItineraries: jest.fn(), getItinerary: jest.fn(), generateItinerary: jest.fn(),
    activateItinerary: jest.fn(), deleteItinerary: jest.fn(),
  },
  searchAddresses: jest.fn(),
  cityService: { getCities: jest.fn() },
  placesService: { getHighlights: jest.fn() },
}));

const ROMA = { slug: 'roma', name: 'Roma', country: 'IT', latitude: 41.9028, longitude: 12.4964, spots: 807 };
const PARIS = { slug: 'paris', name: 'Paris', country: 'FR', latitude: 48.8566, longitude: 2.3522, spots: 862 };
const cidades = cityService.getCities as jest.Mock;
const destaques = placesService.getHighlights as jest.Mock;

const svc = ItineraryService as unknown as Record<string, jest.Mock>;
const buscar = searchAddresses as jest.Mock;

const parada = (orderIndex: number, name: string, time: string, visitDate = '2026-11-10') => ({
  name, address: `${name}, Roma`, latitude: 41.9, longitude: 12.48, estimatedVisitTime: time, orderIndex, visitDate,
  category: 'attraction',
});

const roteiro = (id: number, active: boolean, extra: Partial<Itinerary> = {}): Itinerary => ({
  id, active, startDate: '2026-11-10', endDate: '2026-11-11', name: `Viagem ${id}`,
  places: [parada(0, `Lugar ${id}A`, '09:00:00'), parada(1, `Lugar ${id}B`, '12:00:00'), parada(2, `Lugar ${id}C`, '09:00:00', '2026-11-11')],
  ...extra,
});

const tocarNoBotao = (texto: string) => {
  const buttons = (Alert.alert as jest.Mock).mock.calls.at(-1)?.[2] as AlertButton[];
  return buttons.find((b) => b.text === texto)?.onPress?.();
};

beforeEach(() => {
  cidades.mockResolvedValue([ROMA, PARIS]);
  jest.clearAllMocks();
  destaques.mockResolvedValue([]);
  mockUser = { id: 1, firstName: 'Ana', lastName: 'Souza', isAdmin: false };
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  useItineraryStore.setState({ itinerary: null, itineraries: [], loading: false, error: null, selectedDay: null });
});

describe('meus roteiros', () => {
  it('mostra o roteiro ativo e os outros, abre, ativa e apaga', async () => {
    svc.getAllItineraries.mockResolvedValue([roteiro(1, true, { name: null, city: 'roma' }), roteiro(2, false)]);
    svc.activateItinerary.mockResolvedValue(roteiro(2, true));
    svc.deleteItinerary.mockResolvedValue(undefined);
    await render(<Roteiros />);

    expect(await screen.findByText('ROTEIRO ATIVO')).toBeTruthy();
    expect(screen.getByText('Roteiro Roma, dia 10/11')).toBeTruthy();
    expect(screen.getByText('Viagem 2')).toBeTruthy();
    expect(screen.getByText('Olá, Ana')).toBeTruthy();
    expect(screen.getByText('Dia 1 de 2')).toBeTruthy();

    await fireEvent.press(screen.getByText('Abrir Roteiro'));
    expect(mockRouter.push).toHaveBeenCalledWith('/itinerario');

    await fireEvent.press(screen.getByText('Ativar'));
    await waitFor(() => expect(svc.activateItinerary).toHaveBeenCalledWith(2, 1));

    await fireEvent.press(screen.getAllByLabelText('Excluir')[0]);
    await tocarNoBotao('Excluir');
    await waitFor(() => expect(svc.deleteItinerary).toHaveBeenCalled());
  });

  it('mostra os lugares em alta com a avaliacao e abre o detalhe com o xid', async () => {
    svc.getAllItineraries.mockResolvedValue([]);
    const coliseu = {
      spot: { name: 'Colosseo', names: { pt: 'Coliseu' }, latitude: 41.89, longitude: 12.49 },
      xid: 'osm_colosseo', city: 'roma', imageUrl: 'https://upload.wikimedia.org/coliseu.jpg',
      average: 4.5, ratingsCount: 2, latestReview: { userName: 'Maria Souza', rating: 5, comment: 'Imperdivel' },
    };
    destaques.mockResolvedValue([
      coliseu,
      { ...coliseu, spot: { ...coliseu.spot, name: 'Louvre', names: null }, xid: 'osm_louvre', city: 'paris', imageUrl: null,
        average: 0, ratingsCount: 0, latestReview: null },
    ]);
    await render(<Roteiros />);

    expect(await screen.findByText('Em alta')).toBeTruthy();
    expect(screen.getByText('Coliseu')).toBeTruthy();
    expect(screen.getByText('4,5')).toBeTruthy();
    expect(screen.getByText('(2 avaliações)')).toBeTruthy();
    expect(screen.getByText('"Imperdivel"')).toBeTruthy();
    expect(screen.getByText('- Maria Souza')).toBeTruthy();
    expect(screen.getByText('Seja o primeiro a avaliar')).toBeTruthy();

    await fireEvent.press(screen.getByText('Coliseu'));
    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/SpotDetailScreen',
      params: { spot: JSON.stringify({ ...coliseu.spot, xid: 'osm_colosseo' }), origin: 'inicio' },
    });
  });

  it('sem roteiro ativo continua mostrando os outros roteiros', async () => {
    svc.getAllItineraries.mockResolvedValue([roteiro(2, false), roteiro(3, false)]);
    await render(<Roteiros />);

    expect(await screen.findByText('OUTROS ROTEIROS')).toBeTruthy();
    expect(screen.queryByText('ROTEIRO ATIVO')).toBeNull();
    expect(screen.getAllByText('Ativar')).toHaveLength(2);
  });

  it('seleciona varios roteiros e exclui de uma vez', async () => {
    svc.getAllItineraries.mockResolvedValue([roteiro(1, true), roteiro(2, false)]);
    svc.deleteItinerary.mockResolvedValue(undefined);
    await render(<Roteiros />);

    await fireEvent(await screen.findByText('Viagem 2'), 'longPress');
    expect(screen.getAllByText('1 selecionado').length).toBeGreaterThan(0);
    await fireEvent.press(screen.getByText('Todos'));
    expect(screen.getAllByText('2 selecionados').length).toBeGreaterThan(0);
    await fireEvent.press(screen.getByText('Viagem 2'));
    await fireEvent.press(screen.getByText('Viagem 2'));
    await fireEvent.press(screen.getByText('🗑️  Excluir (2)'));
    await tocarNoBotao('Excluir');

    await waitFor(() => expect(svc.deleteItinerary).toHaveBeenCalledTimes(2));
  });

  it('cancela a selecao e mostra mais roteiros antigos', async () => {
    const antigos = [2, 3, 4, 5, 6].map((id) => roteiro(id, false));
    svc.getAllItineraries.mockResolvedValue([roteiro(1, true), ...antigos]);
    await render(<Roteiros />);

    await fireEvent.press(await screen.findByText('Mostrar mais (+1)'));
    expect(screen.getAllByText('Ativar')).toHaveLength(5);

    await fireEvent(screen.getByText('Viagem 2'), 'longPress');
    await fireEvent.press(screen.getByText('Cancelar'));
    expect(screen.queryAllByText('1 selecionado')).toHaveLength(0);
  });

  it('avisa quando apagar ou ativar falha', async () => {
    svc.getAllItineraries.mockResolvedValue([roteiro(1, true), roteiro(2, false)]);
    svc.activateItinerary.mockRejectedValue(apiError(403, 'ACCESS_DENIED', 'Sem permissão.'));
    svc.deleteItinerary.mockRejectedValue(networkError());
    await render(<Roteiros />);

    await fireEvent.press(await screen.findByText('Ativar'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Sem permissão.', undefined));

    await fireEvent.press(screen.getAllByLabelText('Excluir')[0]);
    await tocarNoBotao('Excluir');
    await waitFor(() => expect(Alert.alert).toHaveBeenLastCalledWith('Erro', expect.stringContaining('conectar'), undefined));
  });

  it('sem nenhum roteiro convida a criar o primeiro, e o admin ve o atalho do painel', async () => {
    mockUser = { ...mockUser, isAdmin: true };
    svc.getAllItineraries.mockResolvedValue([]);
    await render(<Roteiros />);

    await fireEvent.press(await screen.findByText('Criar meu primeiro roteiro'));
    expect(await screen.findByText('Novo Roteiro')).toBeTruthy();

    await fireEvent.press(screen.getByText('Painel Administrador'));
    expect(mockRouter.push).toHaveBeenCalledWith('/UserListScreen');
    await fireEvent.press(screen.getByText('Explorar destinos'));
    expect(mockRouter.push).toHaveBeenCalledWith('/ExploreScreen');
  });

  it('abre o fluxo de gerar quando chega pelo atalho e pela busca de destinos', async () => {
    setMockParams({ openGenerate: '1' });
    svc.getAllItineraries.mockResolvedValue([roteiro(1, true)]);
    await render(<Roteiros />);

    expect(await screen.findByText('Novo Roteiro')).toBeTruthy();
    expect(mockRouter.setParams).toHaveBeenCalledWith({ openGenerate: undefined });
    await fireEvent.press(screen.getByText('✕'));
    await fireEvent.press(screen.getByPlaceholderText('Buscar destinos'));
    expect(await screen.findByText('Novo Roteiro')).toBeTruthy();
  });

  it('a busca de destinos nao tem atalho de uma cidade so', async () => {
    svc.getAllItineraries.mockResolvedValue([roteiro(1, true)]);
    await render(<Roteiros />);

    expect(await screen.findByText('Qual o próximo roteiro?')).toBeTruthy();
    expect(screen.queryByText('Roma')).toBeNull();
  });
});

describe('gerar roteiro', () => {
  const sugestao = { lat: 41.9, lng: 12.48, shortName: 'Via Veneto 45', displayName: 'Via Veneto 45, Ludovisi, Roma, Italia' };
  const gerado = roteiro(9, true, { endDate: '2026-11-11', places: [parada(0, 'Colosseo', '10:00:00'), parada(1, 'Pantheon', '12:00:00'), parada(2, 'Trevi', '21:00:00', '2026-11-11')] });

  const abrir = async () => {
    const onAccept = jest.fn();
    const onClose = jest.fn();
    await render(<GenerateItineraryFlow visible onAccept={onAccept} onClose={onClose} />);
    return { onAccept, onClose };
  };

  const escolherCidade = async (rotulo = 'Roma, Itália') => {
    await fireEvent.press(await screen.findByLabelText('Escolha a cidade'));
    await fireEvent.press(await screen.findByText(rotulo));
  };

  const ENDERECO = 'Ex: nome do hotel ou rua e número';

  const escolherEndereco = async () => {
    buscar.mockResolvedValue([sugestao]);
    await fireEvent.changeText(screen.getByPlaceholderText(ENDERECO), 'veneto');
    await fireEvent.press(await screen.findByText('Via Veneto 45', {}, { timeout: 2000 }));
  };

  it('busca o endereco, configura data, dias e ritmo, gera e aceita', async () => {
    svc.generateItinerary.mockResolvedValue(gerado);
    const { onAccept } = await abrir();

    await escolherCidade();
    await escolherEndereco();
    await fireEvent.press(screen.getByLabelText('Escolher data de início'));
    await fireEvent.press(screen.getByTestId('date-picker'));
    await fireEvent.press(screen.getByLabelText('Mais um dia'));
    await fireEvent.press(screen.getByLabelText('Mais um dia'));
    await fireEvent.press(screen.getByLabelText('Menos um dia'));
    expect(screen.getByText('2 dias')).toBeTruthy();
    await fireEvent.press(screen.getByText('Roteiro leve, sem pressa'));
    await fireEvent.changeText(screen.getByPlaceholderText('Roteiro Roma, dia 20/11'), '  Ferias em Roma ');
    await fireEvent.press(screen.getByText('Gerar Roteiro'));

    expect(await screen.findByText('Roteiro Gerado', {}, { timeout: 4000 })).toBeTruthy();
    expect(svc.generateItinerary).toHaveBeenCalledWith(1, 41.9, 12.48, '2026-11-20', 2, 'LEVE', 'roma', 'Ferias em Roma');
    expect(buscar).toHaveBeenCalledWith('veneto', ROMA);
    expect(screen.getByText('Colosseo')).toBeTruthy();

    await fireEvent.press(screen.getByText('Aceitar'));
    expect(onAccept).toHaveBeenCalledWith(gerado);
    expect(useItineraryStore.getState().itinerary?.id).toBe(9);
  }, 15000);

  it('mostra o erro ao gerar e permite gerar de novo', async () => {
    svc.generateItinerary.mockRejectedValueOnce(networkError()).mockResolvedValue(gerado);
    await abrir();
    await escolherCidade();
    await escolherEndereco();

    await fireEvent.press(screen.getByText('Gerar Roteiro'));
    expect(await screen.findByText(/Não foi possível conectar/, {}, { timeout: 4000 })).toBeTruthy();

    await fireEvent.press(screen.getByText('Tentar novamente'));
    expect(await screen.findByText('Roteiro Gerado', {}, { timeout: 4000 })).toBeTruthy();
    await fireEvent.press(screen.getByText('Re-gerar'));
    expect(await screen.findByText('Roteiro Gerado', {}, { timeout: 4000 })).toBeTruthy();
  }, 20000);

  it('usa a localizacao atual, limpa o campo e avisa quando nada e encontrado', async () => {
    const { onClose } = await abrir();
    await escolherCidade();

    await fireEvent.press(screen.getByText('Localização atual'));
    expect((await screen.findAllByText('Localização atual')).length).toBeGreaterThan(1);

    await fireEvent.press(screen.getAllByText('✕').at(-1)!);
    buscar.mockResolvedValue([]);
    await fireEvent.changeText(screen.getByPlaceholderText(ENDERECO), 'zzzz');
    expect(await screen.findByText(/Nenhum endereço encontrado/, {}, { timeout: 2000 })).toBeTruthy();

    buscar.mockRejectedValue(networkError());
    await fireEvent.changeText(screen.getByPlaceholderText(ENDERECO), 'yyyy');
    expect(await screen.findByText(/Não foi possível conectar/, {}, { timeout: 2000 })).toBeTruthy();

    await fireEvent.changeText(screen.getByPlaceholderText(ENDERECO), 'ab');
    await fireEvent.press(screen.getAllByText('✕')[0]);
    expect(onClose).toHaveBeenCalled();
  }, 15000);

  it('sem cidade escolhida nao da para buscar a partida nem gerar', async () => {
    await abrir();
    expect(await screen.findByText('Escolha o destino primeiro')).toBeTruthy();
    expect(screen.queryByPlaceholderText(ENDERECO)).toBeNull();
    await fireEvent.press(screen.getByText('Gerar Roteiro'));
    expect(svc.generateItinerary).not.toHaveBeenCalled();
  });

  it('trocar de cidade descarta a partida, e o centro da cidade serve de partida', async () => {
    svc.generateItinerary.mockResolvedValue(gerado);
    await abrir();
    await escolherCidade();
    await escolherEndereco();
    expect(screen.getByText(/Via Veneto 45, Ludovisi/)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Escolha a cidade'));
    await fireEvent.press(await screen.findByText('Paris, França'));
    expect(screen.queryByText(/Via Veneto 45, Ludovisi/)).toBeNull();
    expect(screen.getByText('Digite seu hotel ou endereço em Paris')).toBeTruthy();

    await fireEvent.press(screen.getByText('Centro da cidade'));
    await fireEvent.press(screen.getByText('Gerar Roteiro'));
    expect(await screen.findByText('Roteiro Gerado', {}, { timeout: 4000 })).toBeTruthy();
    expect(svc.generateItinerary).toHaveBeenCalledWith(1, 48.8566, 2.3522, expect.any(String), 1, 'INTENSO', 'paris', undefined);
    expect(screen.getByText('Paris, França')).toBeTruthy();
  }, 15000);

  it('avisa quando as cidades nao carregam e tenta de novo ao tocar', async () => {
    cidades.mockRejectedValueOnce(networkError());
    await abrir();
    await fireEvent.press(await screen.findByText(/Não foi possível carregar as cidades/));
    await escolherCidade('Paris, França');
    expect(screen.getByText('Digite seu hotel ou endereço em Paris')).toBeTruthy();
  });
});
