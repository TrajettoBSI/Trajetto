import React from 'react';
import { Alert, AlertButton } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import Roteiros from '@/src/pages/tabs/roteiros/Roteiros';
import GenerateItineraryFlow from '@/components/GenerateItineraryFlow';
import { ItineraryService, searchAddresses } from '@/services';
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
}));

const svc = ItineraryService as unknown as Record<string, jest.Mock>;
const buscar = searchAddresses as jest.Mock;

const parada = (orderIndex: number, name: string, time: string, visitDate = '2026-11-10') => ({
  name, address: `${name}, Roma`, latitude: 41.9, longitude: 12.48, estimatedVisitTime: time, orderIndex, visitDate,
  category: 'attraction',
});

const roteiro = (id: number, active: boolean, extra: Partial<Itinerary> = {}): Itinerary => ({
  id, active, startDate: '2026-11-10', endDate: '2026-11-11',
  places: [parada(0, `Lugar ${id}A`, '09:00:00'), parada(1, `Lugar ${id}B`, '12:00:00'), parada(2, `Lugar ${id}C`, '09:00:00', '2026-11-11')],
  ...extra,
});

const tocarNoBotao = (texto: string) => {
  const buttons = (Alert.alert as jest.Mock).mock.calls.at(-1)?.[2] as AlertButton[];
  return buttons.find((b) => b.text === texto)?.onPress?.();
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = { id: 1, firstName: 'Ana', lastName: 'Souza', isAdmin: false };
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  useItineraryStore.setState({ itinerary: null, itineraries: [], loading: false, error: null, selectedDay: null });
});

describe('meus roteiros', () => {
  it('mostra o roteiro ativo e os outros, abre, ativa e apaga', async () => {
    svc.getAllItineraries.mockResolvedValue([roteiro(1, true), roteiro(2, false)]);
    svc.activateItinerary.mockResolvedValue(roteiro(2, true));
    svc.deleteItinerary.mockResolvedValue(undefined);
    await render(<Roteiros />);

    expect(await screen.findByText('ROTEIRO ATIVO')).toBeTruthy();
    expect(screen.getByText('Olá, Ana 👋')).toBeTruthy();
    expect(screen.getByText('Dia 1 de 2')).toBeTruthy();

    await fireEvent.press(screen.getByText('Abrir Roteiro'));
    expect(mockRouter.push).toHaveBeenCalledWith('/itinerario');

    await fireEvent.press(screen.getByText('Ativar'));
    await waitFor(() => expect(svc.activateItinerary).toHaveBeenCalledWith(2, 1));

    await fireEvent.press(screen.getAllByLabelText('Excluir')[0]);
    await tocarNoBotao('Excluir');
    await waitFor(() => expect(svc.deleteItinerary).toHaveBeenCalled());
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

    await fireEvent(await screen.findByText('Lugar 2A'), 'longPress');
    expect(screen.getAllByText('1 selecionado').length).toBeGreaterThan(0);
    await fireEvent.press(screen.getByText('Todos'));
    expect(screen.getAllByText('2 selecionados').length).toBeGreaterThan(0);
    await fireEvent.press(screen.getByText('Lugar 2A'));
    await fireEvent.press(screen.getByText('Lugar 2A'));
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

    await fireEvent(screen.getByText('Lugar 2A'), 'longPress');
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

  it('abre o fluxo de gerar quando chega pelo atalho e pelo chip de Roma', async () => {
    setMockParams({ openGenerate: '1' });
    svc.getAllItineraries.mockResolvedValue([roteiro(1, true)]);
    await render(<Roteiros />);

    expect(await screen.findByText('Novo Roteiro')).toBeTruthy();
    expect(mockRouter.setParams).toHaveBeenCalledWith({ openGenerate: undefined });
    await fireEvent.press(screen.getByText('✕'));
    await fireEvent.press(screen.getAllByText('Roma')[0]);
    expect((await screen.findAllByText('Roma, Itália')).length).toBeGreaterThan(0);
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

  const escolherEndereco = async () => {
    buscar.mockResolvedValue([sugestao]);
    await fireEvent.changeText(screen.getByPlaceholderText('Ex: Via Veneto 45, Roma'), 'veneto');
    await fireEvent.press(await screen.findByText('Via Veneto 45', {}, { timeout: 2000 }));
  };

  it('busca o endereco, configura data, dias e ritmo, gera e aceita', async () => {
    svc.generateItinerary.mockResolvedValue(gerado);
    const { onAccept } = await abrir();

    await escolherEndereco();
    await fireEvent.press(screen.getByLabelText('Escolher data de início'));
    await fireEvent.press(screen.getByTestId('date-picker'));
    await fireEvent.press(screen.getByLabelText('Mais um dia'));
    await fireEvent.press(screen.getByLabelText('Mais um dia'));
    await fireEvent.press(screen.getByLabelText('Menos um dia'));
    expect(screen.getByText('2 dias')).toBeTruthy();
    await fireEvent.press(screen.getByText('Roteiro leve, sem pressa'));
    await fireEvent.press(screen.getByText('Gerar Roteiro'));

    expect(await screen.findByText('Roteiro Gerado', {}, { timeout: 4000 })).toBeTruthy();
    expect(svc.generateItinerary).toHaveBeenCalledWith(1, 41.9, 12.48, '2026-11-20', 2, 'LEVE');
    expect(screen.getByText('Colosseo')).toBeTruthy();

    await fireEvent.press(screen.getByText('Aceitar'));
    expect(onAccept).toHaveBeenCalledWith(gerado);
    expect(useItineraryStore.getState().itinerary?.id).toBe(9);
  }, 15000);

  it('mostra o erro ao gerar e permite gerar de novo', async () => {
    svc.generateItinerary.mockRejectedValueOnce(networkError()).mockResolvedValue(gerado);
    await abrir();
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

    await fireEvent.press(screen.getByText('Localização atual'));
    expect((await screen.findAllByText('Localização atual')).length).toBeGreaterThan(1);

    await fireEvent.press(screen.getAllByText('✕').at(-1)!);
    buscar.mockResolvedValue([]);
    await fireEvent.changeText(screen.getByPlaceholderText('Ex: Via Veneto 45, Roma'), 'zzzz');
    expect(await screen.findByText(/Nenhum endereço encontrado/, {}, { timeout: 2000 })).toBeTruthy();

    buscar.mockRejectedValue(networkError());
    await fireEvent.changeText(screen.getByPlaceholderText('Ex: Via Veneto 45, Roma'), 'yyyy');
    expect(await screen.findByText(/Não foi possível conectar/, {}, { timeout: 2000 })).toBeTruthy();

    await fireEvent.changeText(screen.getByPlaceholderText('Ex: Via Veneto 45, Roma'), 'ab');
    await fireEvent.press(screen.getAllByText('✕')[0]);
    expect(onClose).toHaveBeenCalled();
  }, 15000);
});
