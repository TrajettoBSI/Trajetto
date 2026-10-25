import { api } from '@/services/api';
import {
  authService, favoriteService, ItineraryService, placesService, RatingService, RouteService,
  searchAddresses, searchByCity, statsService, userService,
} from '@/services';
import { apiError } from '../../helpers';

jest.mock('@/services/api', () => {
  const handlers: { rejected: (e: unknown) => Promise<unknown> }[] = [];
  return {
    api: {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        response: {
          handlers,
          use: jest.fn((_ok: unknown, rejected: (e: unknown) => Promise<unknown>) => handlers.push({ rejected }) - 1),
          eject: jest.fn(),
        },
      },
    },
  };
});

const mockedApi = api as unknown as Record<'get' | 'post' | 'put' | 'patch' | 'delete', jest.Mock> & {
  interceptors: { response: { handlers: { rejected: (e: unknown) => Promise<unknown> }[]; eject: jest.Mock } };
};

const responde = (data: unknown) => Promise.resolve({ data });

beforeEach(() => {
  ['get', 'post', 'put', 'patch', 'delete'].forEach((m) =>
    (mockedApi as unknown as Record<string, jest.Mock>)[m].mockReset().mockImplementation(() => responde({ ok: true })));
});

describe('authService', () => {
  it('chama os endpoints de conta e normaliza o e-mail', async () => {
    mockedApi.post.mockImplementationOnce(() => responde({ token: 'abc', user: { id: 1 } }));

    expect(await authService.login({ email: 'a@b.com', password: 'x' })).toEqual({ token: 'abc', user: { id: 1 } });
    await authService.register({ firstName: 'Ana' } as never);
    await authService.logout();
    await authService.verifyEmail('a@b.com', '123456');
    await authService.resendVerificationCode('a@b.com');
    await authService.requestPasswordCode('  Ana@B.com ');
    await authService.resetPassword({ email: 'Ana@B.com', code: '1', newPassword: 'n' });

    expect(mockedApi.post.mock.calls).toEqual([
      ['/user/login', { email: 'a@b.com', password: 'x' }],
      ['/user/create', { firstName: 'Ana' }],
      ['/user/logout'],
      ['/user/verify', null, { params: { email: 'a@b.com', code: '123456' } }],
      ['/user/verify/resend', null, { params: { email: 'a@b.com' } }],
      ['/user/password/forgot', { email: 'ana@b.com' }],
      ['/user/password/reset', { email: 'ana@b.com', code: '1', newPassword: 'n' }],
    ]);
  });

  it('avisa quando a API diz que a sessao acabou, e so nesse caso', async () => {
    const handler = jest.fn();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const cancelar = authService.onSessionExpired(handler);
    const interceptor = mockedApi.interceptors.response.handlers.at(-1)!;

    await expect(interceptor.rejected(apiError(401, 'SESSION_EXPIRED', 'x'))).rejects.toBeDefined();
    await expect(interceptor.rejected(apiError(404, 'RESOURCE_NOT_FOUND', 'x'))).rejects.toBeDefined();
    expect(handler).toHaveBeenCalledTimes(1);

    cancelar();
    expect(mockedApi.interceptors.response.eject).toHaveBeenCalled();
  });
});

describe('userService', () => {
  it('le e altera cadastros', async () => {
    await userService.getProfile();
    await userService.updateProfile({ firstName: 'Ana' } as never);
    await userService.updateTravelerProfile('CULTURAL');
    await userService.getAll();
    await userService.update(7, { firstName: 'Bia' } as never);
    await userService.updateRole(7, true);
    await userService.remove(7);

    expect(mockedApi.get.mock.calls).toEqual([['/user/me'], ['/user']]);
    expect(mockedApi.put.mock.calls).toEqual([
      ['/user/me', { firstName: 'Ana' }], ['/user/me', { travelerProfile: 'CULTURAL' }], ['/user/7/role', { isAdmin: true }],
    ]);
    expect(mockedApi.patch).toHaveBeenCalledWith('/user/7', { firstName: 'Bia' });
    expect(mockedApi.delete).toHaveBeenCalledWith('/user/7');
  });
});

describe('ItineraryService', () => {
  it('chama cada operacao de roteiro no endpoint certo', async () => {
    await ItineraryService.getItinerary(1);
    await ItineraryService.generateItinerary(1, 41.9, 12.4, '2026-11-10', 3, 'LEVE');
    await ItineraryService.getAllItineraries(1);
    await ItineraryService.activateItinerary(5, 1);
    await ItineraryService.deleteItinerary(5, 1);
    await ItineraryService.rateItinerary(5, 4, 'bom');
    await ItineraryService.updateDate(5, '2026-11-10');
    await ItineraryService.updateNote(5, 2, 'nota');
    await ItineraryService.updateName(5, 'Ferias');
    await ItineraryService.replacePlace(5, 2, { name: 'X' } as never);
    await ItineraryService.addPlace(5, { name: 'Y', latitude: 1, longitude: 2, visitDate: '2026-11-10' });
    await ItineraryService.removePlace(5, 3);
    await ItineraryService.movePlace(5, 1, 'DOWN');

    expect(mockedApi.get.mock.calls).toEqual([['/itinerary/active/1'], ['/itinerary/all/1']]);
    expect(mockedApi.post).toHaveBeenCalledWith('/itinerary/generate', {
      userId: 1, startLatitude: 41.9, startLongitude: 12.4, startDate: '2026-11-10', days: 3, pace: 'LEVE',
    });
    expect(mockedApi.patch.mock.calls.map((c) => c[0])).toEqual([
      '/itinerary/5/activate/1', '/itinerary/5/rating', '/itinerary/5/date', '/itinerary/5/place/2/note', '/itinerary/5/name', '/itinerary/5/place/2',
      '/itinerary/5/place/1/move',
    ]);
    expect(mockedApi.patch).toHaveBeenLastCalledWith('/itinerary/5/place/1/move', null, { params: { direction: 'DOWN' } });
    expect(mockedApi.post).toHaveBeenLastCalledWith('/itinerary/5/place', { name: 'Y', latitude: 1, longitude: 2, visitDate: '2026-11-10' });
    expect(mockedApi.delete).toHaveBeenCalledWith('/itinerary/5/user/1');
    expect(mockedApi.delete).toHaveBeenCalledWith('/itinerary/5/place/3');
  });
});

describe('servicos de lugares, favoritos, avaliacoes e rotas', () => {
  it('monta os filtros do catalogo so com o que foi escolhido', async () => {
    await placesService.getAll({ search: 'Col', category: 'museum', fee: 'no', hasHours: true, profile: 'SOCIAL', lat: 41, lng: 12, maxDistance: 500 });
    await placesService.getAll();
    await placesService.nearby(41, 12, { radius: 1000, category: 'cafe' });
    await placesService.getCategories();
    await placesService.getProfiles();
    await placesService.getHighlights();

    expect(mockedApi.get.mock.calls).toEqual([
      ['/places', { params: { search: 'Col', category: 'museum', fee: 'no', hasHours: true, profile: 'SOCIAL', lat: 41, lng: 12, maxDistance: 500 } }],
      ['/places', { params: {} }],
      ['/places/nearby', { params: { lat: 41, lng: 12, radius: 1000, category: 'cafe' } }],
      ['/places/categories'],
      ['/places/profiles'],
      ['/places/highlights', { params: { limit: 5 } }],
    ]);
  });

  it('favoritos, avaliacoes, rotas e busca por cidade', async () => {
    mockedApi.get.mockImplementation((url: string) => responde(url.endsWith('average') ? 4.5 : [{ id: 1 }, { id: 2 }]));

    await favoriteService.list();
    await favoriteService.mark({ name: 'Colosseo', latitude: 1, longitude: 2 });
    await favoriteService.unmark('osm_colosseo');
    expect(await RatingService.getSummary('osm_x')).toEqual({ average: 4.5, count: 2 });
    await RatingService.getByPlace('osm_x');
    await RatingService.create({ placeId: 'osm_x', userId: 1, userName: 'Ana', rating: 5 });
    await RatingService.update(3, { userId: 1, rating: 4, comment: 'ok' });
    await RatingService.delete(3, 1);
    await RouteService.getRoute({ origin: {}, destination: {} });
    await RouteService.getDirections({ lat: 1, lng: 2 }, { lat: 3, lng: 4 }, 'pt', 10);
    await searchByCity('Roma');

    expect(mockedApi.delete).toHaveBeenCalledWith('/favorites/osm_colosseo');
    expect(mockedApi.put).toHaveBeenCalledWith('/api/ratings/3', null, { params: { userId: 1, rating: 4, comment: 'ok' } });
    expect(mockedApi.post).toHaveBeenCalledWith('/route', { origin: {}, destination: {} });
    expect(mockedApi.post).toHaveBeenCalledWith('/route/directions', {
      origin: { lat: 1, lng: 2 }, destination: { lat: 3, lng: 4 }, language: 'pt', hour: 10,
    });
    expect(mockedApi.get).toHaveBeenCalledWith('/api/tourist-spots', { params: { city: 'Roma', radius: 10000 } });
  });

  it('estatisticas do painel mandam so os criterios preenchidos', async () => {
    const filtro = { from: '2026-01-01', to: '', profile: null, country: 'Brasil' };
    const chamadas = [
      statsService.getOverview, statsService.getCountries, statsService.getTravelerProfiles,
      statsService.getItinerariesPerUser, statsService.getAgeGroups, statsService.getItineraryOverview,
      statsService.getItinerariesPerMonth, statsService.getPlacesByCategory, statsService.getTopRatedPlaces,
      statsService.getMostCommentedPlaces, statsService.getMostVisitedPlaces,
    ];
    for (const chamada of chamadas) await chamada(filtro);
    await statsService.getFilterOptions();
    await statsService.getOverview();

    expect(mockedApi.get).toHaveBeenCalledWith('/stats/overview', { params: { from: '2026-01-01', country: 'Brasil' } });
    expect(mockedApi.get).toHaveBeenCalledWith('/stats/overview', { params: {} });
    expect(mockedApi.get).toHaveBeenCalledTimes(13);
  });
});

describe('busca de enderecos (Nominatim)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('transforma a resposta em sugestoes com nome curto', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => [
        { lat: '41.9', lon: '12.5', display_name: 'Via Veneto 45, Roma, Italia', address: { road: 'Via Veneto', house_number: '45', suburb: 'Ludovisi' } },
        { lat: '41.8', lon: '12.4', display_name: 'Piazza Navona, Roma', address: {} },
      ],
    } as Response);

    expect(await searchAddresses('veneto')).toEqual([
      { lat: 41.9, lng: 12.5, displayName: 'Via Veneto 45, Roma, Italia', shortName: 'Via Veneto 45, Ludovisi' },
      { lat: 41.8, lng: 12.4, displayName: 'Piazza Navona, Roma', shortName: 'Piazza Navona' },
    ]);
  });

  it('resposta fora do formato vira lista vazia', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ json: async () => ({ erro: true }) } as Response);
    expect(await searchAddresses('x')).toEqual([]);
  });
});
