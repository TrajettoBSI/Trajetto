import { favoriteService, ItineraryService } from '@/services';
import { Itinerary, useItineraryStore } from '@/hooks/itineraryStore';
import { findFavorite, useFavoritesStore } from '@/hooks/favoritesStore';
import { networkError } from '../../helpers';

jest.mock('@/services', () => ({
  ItineraryService: {
    getItinerary: jest.fn(), getAllItineraries: jest.fn(), generateItinerary: jest.fn(), activateItinerary: jest.fn(),
    deleteItinerary: jest.fn(), rateItinerary: jest.fn(), updateDate: jest.fn(), replacePlace: jest.fn(), updateNote: jest.fn(),
    addPlace: jest.fn(), removePlace: jest.fn(), movePlace: jest.fn(),
  },
  favoriteService: { list: jest.fn(), mark: jest.fn(), unmark: jest.fn() },
}));

const roteiro = (id: number, active = true): Itinerary => ({
  id, active, startDate: '2026-11-10', endDate: '2026-11-10',
  places: [{ name: 'Colosseo', address: '', latitude: 1, longitude: 2, estimatedVisitTime: '09:00:00', orderIndex: 0 }],
});

const svc = ItineraryService as unknown as Record<string, jest.Mock>;
const fav = favoriteService as unknown as Record<string, jest.Mock>;

describe('estado do roteiro', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useItineraryStore.setState({ itinerary: null, itineraries: [], loading: false, error: null, selectedDay: null });
  });

  it('carrega o roteiro ativo e guarda a falha quando a busca da errado', async () => {
    svc.getItinerary.mockResolvedValueOnce(roteiro(1));
    await useItineraryStore.getState().fetchItinerary(9);
    expect(useItineraryStore.getState().itinerary?.id).toBe(1);

    svc.getItinerary.mockResolvedValueOnce('');
    await useItineraryStore.getState().fetchItinerary(9);
    expect(useItineraryStore.getState().itinerary).toBeNull();

    svc.getItinerary.mockRejectedValueOnce(networkError());
    await useItineraryStore.getState().fetchItinerary(9);
    expect(useItineraryStore.getState().error).toBeTruthy();
  });

  it('carrega todos os roteiros e separa o ativo', async () => {
    svc.getAllItineraries.mockResolvedValueOnce([roteiro(1, false), roteiro(2, true)]);
    await useItineraryStore.getState().fetchAllItineraries(9);
    expect(useItineraryStore.getState().itinerary?.id).toBe(2);

    svc.getAllItineraries.mockRejectedValueOnce(networkError());
    await useItineraryStore.getState().fetchAllItineraries(9);
    expect(useItineraryStore.getState().itineraries).toEqual([]);
  });

  it('gera, aceita, ativa e apaga roteiros', async () => {
    useItineraryStore.setState({ itineraries: [roteiro(1)], itinerary: roteiro(1) });
    svc.generateItinerary.mockResolvedValueOnce(roteiro(2));
    const novo = await useItineraryStore.getState().generateItinerary(9, 41, 12, '2026-11-10', 2, 'LEVE');
    useItineraryStore.getState().acceptGeneratedItinerary(novo);
    expect(useItineraryStore.getState().itineraries.map((i) => [i.id, i.active])).toEqual([[2, true], [1, false]]);

    svc.activateItinerary.mockResolvedValueOnce(roteiro(1));
    await useItineraryStore.getState().activateItinerary(1, 9);
    expect(useItineraryStore.getState().itinerary?.id).toBe(1);

    svc.deleteItinerary.mockResolvedValueOnce(undefined);
    await useItineraryStore.getState().deleteItinerary(1, 9);
    expect(useItineraryStore.getState().itineraries.map((i) => i.id)).toEqual([2]);
    expect(useItineraryStore.getState().itinerary).toBeNull();
  });

  it('atualiza avaliacao, data, parada e anotacao no roteiro da tela e na lista', async () => {
    const atualizado = { ...roteiro(1), rating: 5 };
    useItineraryStore.setState({ itineraries: [roteiro(1)], itinerary: roteiro(1) });
    svc.rateItinerary.mockResolvedValue(atualizado);
    svc.updateDate.mockResolvedValue(atualizado);
    svc.replacePlace.mockResolvedValue(atualizado);
    svc.updateNote.mockResolvedValue(atualizado);

    await useItineraryStore.getState().rateItinerary(1, 5, 'otimo');
    await useItineraryStore.getState().updateDate(1, '2026-11-10');
    await useItineraryStore.getState().replacePlace(0, roteiro(1).places[0]);
    await useItineraryStore.getState().updateNote(0, 'levar agua');

    expect(useItineraryStore.getState().itinerary?.rating).toBe(5);
    expect(useItineraryStore.getState().itineraries[0].rating).toBe(5);
    expect(svc.updateNote).toHaveBeenCalledWith(1, 0, 'levar agua');

    useItineraryStore.setState({ itinerary: null });
    await useItineraryStore.getState().replacePlace(0, roteiro(1).places[0]);
    await useItineraryStore.getState().updateNote(0, null);
    expect(svc.replacePlace).toHaveBeenCalledTimes(1);
  });

  it('inclui, tira e reordena paradas no roteiro da tela e na lista', async () => {
    const comDuas = { ...roteiro(1), places: [...roteiro(1).places, { ...roteiro(1).places[0], name: 'Pantheon', orderIndex: 1 }] };
    useItineraryStore.setState({ itineraries: [roteiro(1), roteiro(2, false)], itinerary: roteiro(1) });
    svc.addPlace.mockResolvedValue(comDuas);
    svc.movePlace.mockResolvedValue(comDuas);
    svc.removePlace.mockResolvedValue(roteiro(1));

    await useItineraryStore.getState().addPlace({ name: 'Pantheon', latitude: 1, longitude: 2 });
    expect(useItineraryStore.getState().itinerary?.places).toHaveLength(2);
    expect(useItineraryStore.getState().itineraries[0].places).toHaveLength(2);
    expect(useItineraryStore.getState().itineraries[1].places).toHaveLength(1);

    await useItineraryStore.getState().movePlace(1, 'UP');
    expect(svc.movePlace).toHaveBeenCalledWith(1, 1, 'UP');
    await useItineraryStore.getState().removePlace(1);
    expect(svc.removePlace).toHaveBeenCalledWith(1, 1);
    expect(useItineraryStore.getState().itinerary?.places).toHaveLength(1);

    useItineraryStore.setState({ itinerary: null });
    await useItineraryStore.getState().addPlace({ name: 'X', latitude: 1, longitude: 2 });
    await useItineraryStore.getState().removePlace(0);
    await useItineraryStore.getState().movePlace(0, 'DOWN');
    expect(svc.addPlace).toHaveBeenCalledTimes(1);
    expect(svc.removePlace).toHaveBeenCalledTimes(1);
    expect(svc.movePlace).toHaveBeenCalledTimes(1);
  });

  it('guarda destaque, foco no mapa e dia selecionado', () => {
    useItineraryStore.getState().setHighlightedPlace(3);
    useItineraryStore.getState().setFocusedMapPlace(2);
    useItineraryStore.getState().setSelectedDay('2026-11-11');
    expect(useItineraryStore.getState()).toMatchObject({ highlightedPlaceIndex: 3, focusedMapPlaceIndex: 2, selectedDay: '2026-11-11' });
  });
});

describe('estado dos favoritos', () => {
  const coliseu = { id: 1, xid: 'osm_colosseo', name: 'Colosseo', latitude: 1, longitude: 2, createdAt: '' };

  beforeEach(() => {
    jest.clearAllMocks();
    useFavoritesStore.setState({ ownerId: null, favorites: null, loading: false, error: null });
  });

  it('carrega uma vez por usuario e guarda a falha', async () => {
    fav.list.mockResolvedValue([coliseu]);
    await useFavoritesStore.getState().ensureFavorites(1);
    await useFavoritesStore.getState().ensureFavorites(1);
    expect(fav.list).toHaveBeenCalledTimes(1);

    fav.list.mockRejectedValueOnce(networkError());
    await useFavoritesStore.getState().ensureFavorites(2);
    expect(useFavoritesStore.getState().error).toBeTruthy();
  });

  it('marcar e desmarcar alternam o favorito', async () => {
    fav.mark.mockResolvedValue(coliseu);
    fav.unmark.mockResolvedValue(undefined);

    await useFavoritesStore.getState().toggleFavorite({ name: 'Colosseo', latitude: 1, longitude: 2 });
    expect(findFavorite(useFavoritesStore.getState().favorites, ' Colosseo ')).toEqual(coliseu);

    await useFavoritesStore.getState().toggleFavorite({ name: 'Colosseo', latitude: 1, longitude: 2 });
    expect(fav.unmark).toHaveBeenCalledWith('osm_colosseo');
    expect(findFavorite(useFavoritesStore.getState().favorites, 'Colosseo')).toBeNull();
    expect(findFavorite(null, 'x')).toBeNull();
  });
});
