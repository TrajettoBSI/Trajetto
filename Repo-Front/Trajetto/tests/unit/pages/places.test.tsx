import React from 'react';
import { Alert, AlertButton, Linking } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import Explore from '@/src/pages/explore/Explore';
import SpotDetail from '@/src/pages/spot/detail/SpotDetail';
import Favorites from '@/src/pages/favorites/Favorites';
import { favoriteService, placesService, RatingService } from '@/services';
import { useFavoritesStore } from '@/hooks/favoritesStore';
import { mockRouter, setMockParams } from '../../mocks/expoRouter';
import { apiError, networkError } from '../../helpers';

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, firstName: 'Ana', lastName: 'Souza' } }),
}));
jest.mock('@/services', () => ({
  placesService: { getAll: jest.fn(), getCategories: jest.fn() },
  RatingService: { getSummary: jest.fn(), getByPlace: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  favoriteService: { list: jest.fn(), mark: jest.fn(), unmark: jest.fn() },
}));

const places = placesService as unknown as Record<string, jest.Mock>;
const ratings = RatingService as unknown as Record<string, jest.Mock>;
const favorites = favoriteService as unknown as Record<string, jest.Mock>;

const coliseu = {
  name: 'Colosseo', address: 'Piazza del Colosseo', latitude: 41.89, longitude: 12.49, profiles: ['CULTURAL'],
  openingHours: 'Jan 01-Dec 31: 08:30-19:00; Dec 25 off', category: 'attraction', fee: 'yes',
  phone: '+39 06 3996 7700', website: 'https://colosseo.it', wikidata: 'Q10285', wikipedia: 'it:Colosseo', wheelchair: 'yes',
};
const panteao = { ...coliseu, name: 'Pantheon', category: 'historic_church', fee: 'no' };

const tocarNoBotao = (texto: string) => {
  const buttons = (Alert.alert as jest.Mock).mock.calls.at(-1)?.[2] as AlertButton[];
  return buttons.find((b) => b.text === texto)?.onPress?.();
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  useFavoritesStore.setState({ ownerId: null, favorites: null, loading: false, error: null });
});

describe('explorar', () => {
  it('lista os lugares, filtra por categoria e abre o detalhe', async () => {
    places.getCategories.mockResolvedValue(['attraction', 'historic_church']);
    places.getAll.mockResolvedValueOnce([coliseu, panteao]).mockResolvedValue([panteao]);
    await render(<Explore />);

    expect(await screen.findByText('Colosseo')).toBeTruthy();
    expect(screen.getByText('2 resultados')).toBeTruthy();

    await fireEvent.press(screen.getAllByText('Atração')[0]);
    expect(mockRouter.push).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/SpotDetailScreen' }));

    await fireEvent.press(screen.getByLabelText('Filtrar por categoria'));
    await fireEvent.press(screen.getAllByText('Igreja histórica').at(-1)!);
    await fireEvent.press(screen.getByText('Aplicar'));
    await waitFor(() => expect(places.getAll).toHaveBeenLastCalledWith({ search: undefined, category: 'historic_church' }));
    expect(await screen.findByText('1 resultado em "Igreja histórica"')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Filtrar por categoria'));
    await fireEvent.press(screen.getByText('Limpar'));
    await waitFor(() => expect(places.getAll).toHaveBeenLastCalledWith({ search: undefined, category: undefined }));
  });

  it('busca pelo texto digitado e mostra o vazio com opcao de limpar', async () => {
    places.getCategories.mockRejectedValue(networkError());
    places.getAll.mockResolvedValueOnce([coliseu]).mockResolvedValue([]);
    await render(<Explore />);
    await screen.findByText('Colosseo');

    await fireEvent.changeText(screen.getByPlaceholderText('Buscar ponto turístico...'), 'xyz');
    expect(await screen.findByText('Nenhum resultado', {}, { timeout: 2000 })).toBeTruthy();
    expect(places.getAll).toHaveBeenLastCalledWith({ search: 'xyz', category: undefined });

    await fireEvent.press(screen.getByText('Limpar filtros'));
    await waitFor(() => expect(places.getAll).toHaveBeenLastCalledWith({ search: 'xyz', category: undefined }));
  });

  it('mostra o erro quando o catalogo nao carrega e tenta de novo', async () => {
    places.getCategories.mockResolvedValue([]);
    places.getAll.mockRejectedValueOnce(networkError()).mockResolvedValue([coliseu]);
    await render(<Explore />);

    expect(await screen.findByText(/Não foi possível conectar/)).toBeTruthy();
    await fireEvent.press(screen.getByText('Tentar novamente'));
    expect(await screen.findByText('Colosseo')).toBeTruthy();
  });
});

describe('detalhe do local', () => {
  const abrir = async (spot: object = { ...coliseu, xid: 'osm_colosseo' }, origin = 'mapa') => {
    setMockParams({ spot: JSON.stringify(spot), origin });
    await render(<SpotDetail />);
  };

  beforeEach(() => {
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    favorites.list.mockResolvedValue([]);
  });

  it('mostra dados, horarios, perfis e as acoes de contato', async () => {
    ratings.getSummary.mockResolvedValue({ average: 4.5, count: 2 });
    ratings.getByPlace.mockResolvedValue([]);
    await abrir();

    expect(screen.getAllByText('Colosseo').length).toBeGreaterThan(0);
    expect(screen.getByText('Atração')).toBeTruthy();
    expect(screen.getByText('Explorador Cultural')).toBeTruthy();
    expect(screen.getByText('Mapa')).toBeTruthy();
    expect(await screen.findByText('4,5')).toBeTruthy();

    await fireEvent.press(screen.getByText('Rotas'));
    await fireEvent.press(screen.getByText('Ligar'));
    await fireEvent.press(screen.getByText('Website'));
    expect(Linking.openURL).toHaveBeenCalledWith('https://www.google.com/maps/dir/?api=1&destination=41.89,12.49');
    expect(Linking.openURL).toHaveBeenCalledWith('tel:+390639967700');
    expect(Linking.openURL).toHaveBeenCalledWith('https://colosseo.it');
  });

  it('avalia o local, edita e exclui a propria avaliacao', async () => {
    const minha = { id: 9, touristSpotXid: 'osm_colosseo', userId: 1, rating: 4, comment: 'Lindo', createdAt: '' };
    const outra = { id: 8, touristSpotXid: 'osm_colosseo', userId: 2, userName: 'Bia', rating: 5, createdAt: '' };
    ratings.getSummary.mockResolvedValue({ average: 4.5, count: 2 });
    ratings.getByPlace.mockResolvedValue([minha, outra]);
    ratings.update.mockResolvedValue(minha);
    ratings.delete.mockResolvedValue(undefined);
    await abrir();

    await fireEvent.press(await screen.findByText('2 visitaram'));
    expect(await screen.findByText('Bia')).toBeTruthy();
    expect(screen.getByText('Ana Souza')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Editar avaliação'));
    await fireEvent.press(screen.getAllByLabelText('5 estrelas')[1]);
    await fireEvent.changeText(screen.getByPlaceholderText('Escreva um comentário...'), 'Imperdivel');
    await fireEvent.press(screen.getByText('Salvar avaliação'));
    await waitFor(() => expect(ratings.update).toHaveBeenCalledWith(9, { userId: 1, rating: 5, comment: 'Imperdivel' }));

    await fireEvent.press(await screen.findByText('2 visitaram'));
    await fireEvent.press(screen.getByLabelText('Excluir avaliação'));
    await tocarNoBotao('Excluir');
    expect(ratings.delete).toHaveBeenCalledWith(9, 1);
  });

  it('cria a primeira avaliacao e avisa quando salvar falha', async () => {
    ratings.getSummary.mockResolvedValue({ average: 0, count: 0 });
    ratings.getByPlace.mockResolvedValue([]);
    ratings.create.mockRejectedValueOnce(apiError(409, 'RESOURCE_CONFLICT', 'Já avaliado.')).mockResolvedValue({ id: 1 });
    await abrir();

    await fireEvent.press(await screen.findByText('0 visitou'));
    await fireEvent.press(screen.getAllByLabelText('3 estrelas')[1]);
    await fireEvent.press(screen.getByText('Salvar avaliação'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('Erro', 'Já avaliado.', undefined));

    await fireEvent.press(screen.getByText('Salvar avaliação'));
    await waitFor(() => expect(ratings.create).toHaveBeenLastCalledWith(expect.objectContaining({ placeId: 'osm_colosseo', rating: 3 })));
  });

  it('favorita e desfavorita pelo coracao do cabecalho', async () => {
    favorites.mark.mockResolvedValue({ id: 1, xid: 'osm_colosseo', name: 'Colosseo', latitude: 41.89, longitude: 12.49, createdAt: '' });
    favorites.unmark.mockResolvedValue(undefined);
    await abrir({ ...panteao, name: 'Colosseo' }, 'favoritos');

    await fireEvent.press(await screen.findByLabelText('Adicionar aos favoritos'));
    expect(await screen.findByLabelText('Remover dos favoritos')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Remover dos favoritos'));
    expect(await screen.findByLabelText('Adicionar aos favoritos')).toBeTruthy();

    favorites.mark.mockRejectedValue(networkError());
    await fireEvent.press(screen.getByLabelText('Adicionar aos favoritos'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalled());

    expect(screen.getByText('Favoritos')).toBeTruthy();
  });
});

describe('meus favoritos', () => {
  it('lista os favoritos e abre o detalhe com o registro completo do catalogo', async () => {
    favorites.list.mockResolvedValue([{ id: 1, xid: 'osm_colosseo', name: 'Colosseo', category: 'attraction', latitude: 1, longitude: 2, createdAt: '' }]);
    places.getAll.mockResolvedValue([coliseu]);
    await render(<Favorites />);

    await fireEvent.press(await screen.findByText('Colosseo'));
    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith(expect.objectContaining({
      pathname: '/SpotDetailScreen', params: expect.objectContaining({ origin: 'favoritos' }),
    })));
    expect(JSON.parse(mockRouter.push.mock.calls[0][0].params.spot)).toMatchObject({ xid: 'osm_colosseo', phone: coliseu.phone });
  });

  it('sem favoritos convida a explorar, e volta pelo cabecalho', async () => {
    favorites.list.mockResolvedValue([]);
    await render(<Favorites />);

    await fireEvent.press(await screen.findByText('Explorar lugares'));
    expect(mockRouter.push).toHaveBeenCalledWith('/ExploreScreen');
  });
});
