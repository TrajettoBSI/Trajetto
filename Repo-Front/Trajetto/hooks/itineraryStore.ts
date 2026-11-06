import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AddPlaceRequest, ItineraryService, TravelPace } from '../services';
import { getErrorMessage, isNetworkError } from '../utils/apiError';

/**
 * Copia dos roteiros no aparelho: sem internet (na viagem, no exterior), o app mostra a
 * ultima versao que carregou em vez de uma tela de erro.
 */
type OfflineCopy = { itinerary: Itinerary | null; itineraries: Itinerary[] };
const offlineKey = (userId: number) => `@trajetto/offline/itineraries/${userId}`;
let offlineOwner: number | null = null;

async function readOfflineCopy(userId: number): Promise<OfflineCopy | null> {
  try {
    const raw = await AsyncStorage.getItem(offlineKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function writeOfflineCopy(userId: number, copy: OfflineCopy) {
  offlineOwner = userId;
  await AsyncStorage.setItem(offlineKey(userId), JSON.stringify(copy)).catch(() => {});
}

export interface Places {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  visitDate?: string | null;
  estimatedVisitTime: string;
  orderIndex: number;
  openingHours?: string | null;
  category?: string | null;
  fee?: string | null;
  xid?: string | null;
  note?: string | null;
  openAtVisit?: boolean | null;
  bookingUrl?: string | null;
  /** Site oficial do lugar pago que nao exige reserva: onde ver preco e comprar o ingresso. */
  ticketUrl?: string | null;
  /** Nome por idioma do app (pt, en, es), quando o lugar e do catalogo. */
  names?: Record<string, string> | null;
  /** Id no Wikidata, de onde vem a foto do lugar. */
  wikidata?: string | null;
  /** Da parada anterior do dia (ou da partida, na primeira) ate esta, em km. */
  distanceFromPreviousKm?: number | null;
  /** Estimativa a pe desde a parada anterior, em minutos. */
  walkingMinutesFromPrevious?: number | null;
}

/** Pedidos em texto livre ja interpretados e aplicados ao roteiro. */
export interface TripPreferences {
  moreCategories: string[];
  lessCategories: string[];
  avoidPaid: boolean;
  pace: string;
  mustInclude: string[];
  exclude: string[];
  placements?: { place: string; day: number; period: '' | 'MANHA' | 'TARDE' | 'NOITE' }[];
  /** MENOS quando o viajante pediu menos caminhada. */
  walking?: string;
}

export interface Itinerary {
  id: number;
  startDate: string;
  endDate: string;
  active: boolean;
  places: Places[];
  originLatitude?: number | null;
  originLongitude?: number | null;
  rating?: number | null;
  ratingDescription?: string | null;
  date?: string | null;
  /** Nome dado pelo usuario; sem ele, vale o nome generico de itineraryTitle. */
  name?: string | null;
  /** Slug da cidade do catalogo. */
  city?: string | null;
  pace?: TravelPace | null;
  /** Caminho total entre as paradas (km em linha reta). */
  distanceKm?: number | null;
  /** Caminho na ordem gulosa, antes da otimizacao 2-opt; nulo em roteiros antigos. */
  baselineDistanceKm?: number | null;
  preferences?: TripPreferences | null;
  /** So na resposta da geracao/ajuste por texto livre: o que o assistente entendeu e o que mudou. */
  assistantSummary?: string | null;
}

type ItineraryStore = {
  itinerary: Itinerary | null;
  itineraries: Itinerary[];
  loading: boolean;
  error: string | null;
  /** Mostrando a copia salva no aparelho porque o servidor nao respondeu. */
  offline: boolean;
  highlightedPlaceIndex: number | null;
  focusedMapPlaceIndex: number | null;
  selectedDay: string | null;
  fetchItinerary: (userId: number) => Promise<void>;
  fetchAllItineraries: (userId: number) => Promise<void>;
  generateItinerary: (userId: number, startLat: number, startLng: number, startDate: string, days: number, pace: TravelPace, city?: string, name?: string, request?: string, language?: string) => Promise<Itinerary>;
  adjustItinerary: (request: string, language?: string) => Promise<Itinerary>;
  acceptGeneratedItinerary: (itinerary: Itinerary) => void;
  activateItinerary: (itineraryId: number, userId: number) => Promise<void>;
  deleteItinerary: (itineraryId: number, userId: number) => Promise<void>;
  rateItinerary: (itineraryId: number, rating: number | null, ratingDescription: string | null) => Promise<void>;
  updateDate: (itineraryId: number, date: string | null) => Promise<void>;
  updateName: (itineraryId: number, name: string | null) => Promise<void>;
  replacePlace: (orderIndex: number, newPlace: Places) => Promise<void>;
  updateNote: (orderIndex: number, note: string | null) => Promise<void>;
  addPlace: (place: AddPlaceRequest) => Promise<void>;
  removePlace: (orderIndex: number) => Promise<void>;
  movePlace: (orderIndex: number, direction: 'UP' | 'DOWN') => Promise<void>;
  setHighlightedPlace: (index: number | null) => void;
  setFocusedMapPlace: (index: number | null) => void;
  setSelectedDay: (date: string | null) => void;
};

type SetState = (fn: (state: ItineraryStore) => Partial<ItineraryStore>) => void;

const applyUpdate = (set: SetState, updated: Itinerary) => set((state) => ({
  itinerary: state.itinerary?.id === updated.id ? updated : state.itinerary,
  itineraries: state.itineraries.map((i) => (i.id === updated.id ? updated : i)),
}));

export const useItineraryStore = create<ItineraryStore>((set, get) => ({
  itinerary: null,
  itineraries: [],
  loading: false,
  error: null,
  offline: false,
  highlightedPlaceIndex: null,
  focusedMapPlaceIndex: null,
  selectedDay: null,

  fetchItinerary: async (userId: number) => {
    try {
      set({ loading: true, error: null });
      const data = await ItineraryService.getItinerary(userId);
      const itinerary = data?.id ? data : null;
      await writeOfflineCopy(userId, { itinerary, itineraries: get().itineraries });
      set({ itinerary, loading: false, offline: false });
    } catch (e) {
      const copy = isNetworkError(e) ? await readOfflineCopy(userId) : null;
      if (copy?.itinerary) {
        set({ itinerary: copy.itinerary, error: null, loading: false, offline: true });
        return;
      }
      // Guardar a falha permite a tela dizer que algo deu errado, em vez de mostrar
      // "voce ainda nao tem roteiro" para quem esta so sem internet.
      set({ itinerary: null, error: getErrorMessage(e), loading: false });
    }
  },

  fetchAllItineraries: async (userId: number) => {
    try {
      set({ loading: true, error: null });
      const data: Itinerary[] = await ItineraryService.getAllItineraries(userId);
      const active = data.find(i => i.active) ?? null;
      await writeOfflineCopy(userId, { itinerary: active, itineraries: data });
      set({ itineraries: data, itinerary: active, loading: false, offline: false });
    } catch (e) {
      const copy = isNetworkError(e) ? await readOfflineCopy(userId) : null;
      if (copy && (copy.itinerary || copy.itineraries.length > 0)) {
        set({ itineraries: copy.itineraries, itinerary: copy.itinerary, error: null, loading: false, offline: true });
        return;
      }
      set({ itineraries: [], itinerary: null, error: getErrorMessage(e), loading: false });
    }
  },

  generateItinerary: async (userId, startLat, startLng, startDate, days, pace, city, name, request, language) => {
    const data = await ItineraryService.generateItinerary(userId, startLat, startLng, startDate, days, pace, city, name, request, language);
    return data as Itinerary;
  },

  adjustItinerary: async (request, language) => {
    const { itinerary } = get();
    if (!itinerary) throw new Error('Sem roteiro ativo');
    const adjusted: Itinerary = await ItineraryService.adjustItinerary(itinerary.id, request, language);
    if (adjusted.id === itinerary.id) {
      applyUpdate(set, adjusted);
      return adjusted;
    }
    const prev = get().itineraries.map(i => ({ ...i, active: false }));
    set({ itinerary: adjusted, itineraries: [adjusted, ...prev] });
    return adjusted;
  },

  acceptGeneratedItinerary: (itinerary: Itinerary) => {
    const prev = get().itineraries.map(i => ({ ...i, active: false }));
    set({ itinerary, itineraries: [itinerary, ...prev], selectedDay: null });
  },

  activateItinerary: async (itineraryId: number, userId: number) => {
    const activated = await ItineraryService.activateItinerary(itineraryId, userId);
    set(state => ({
      itinerary: activated,
      selectedDay: null,
      itineraries: state.itineraries.map(i => ({ ...i, active: i.id === itineraryId })),
    }));
  },

  deleteItinerary: async (itineraryId: number, userId: number) => {
    await ItineraryService.deleteItinerary(itineraryId, userId);
    set(state => {
      const remaining = state.itineraries.filter(i => i.id !== itineraryId);
      const activeStillExists = remaining.find(i => i.active) ?? null;
      return {
        itineraries: remaining,
        itinerary: state.itinerary?.id === itineraryId ? activeStillExists : state.itinerary,
      };
    });
  },

  rateItinerary: async (itineraryId, rating, ratingDescription) => {
    const updated = await ItineraryService.rateItinerary(itineraryId, rating, ratingDescription);
    set(state => ({
      itinerary: state.itinerary?.id === itineraryId ? updated : state.itinerary,
      itineraries: state.itineraries.map(i => i.id === itineraryId ? updated : i),
    }));
  },

  updateDate: async (itineraryId, date) => {
    const updated = await ItineraryService.updateDate(itineraryId, date);
    set(state => ({
      itinerary: state.itinerary?.id === itineraryId ? updated : state.itinerary,
      itineraries: state.itineraries.map(i => i.id === itineraryId ? updated : i),
    }));
  },

  updateName: async (itineraryId, name) => {
    applyUpdate(set, await ItineraryService.updateName(itineraryId, name));
  },

  replacePlace: async (orderIndex, newPlace) => {
    const { itinerary } = get();
    if (!itinerary) return;
    const updated = await ItineraryService.replacePlace(itinerary.id, orderIndex, newPlace);
    set(state => ({
      itinerary: state.itinerary?.id === updated.id ? updated : state.itinerary,
      itineraries: state.itineraries.map(i => i.id === updated.id ? updated : i),
    }));
  },

  updateNote: async (orderIndex, note) => {
    const { itinerary } = get();
    if (!itinerary) return;
    const updated = await ItineraryService.updateNote(itinerary.id, orderIndex, note);
    set(state => ({
      itinerary: state.itinerary?.id === updated.id ? updated : state.itinerary,
      itineraries: state.itineraries.map(i => i.id === updated.id ? updated : i),
    }));
  },

  addPlace: async (place) => {
    const { itinerary } = get();
    if (!itinerary) return;
    applyUpdate(set, await ItineraryService.addPlace(itinerary.id, place));
  },

  removePlace: async (orderIndex) => {
    const { itinerary } = get();
    if (!itinerary) return;
    applyUpdate(set, await ItineraryService.removePlace(itinerary.id, orderIndex));
  },

  movePlace: async (orderIndex, direction) => {
    const { itinerary } = get();
    if (!itinerary) return;
    applyUpdate(set, await ItineraryService.movePlace(itinerary.id, orderIndex, direction));
  },

  setHighlightedPlace: (index) => set({ highlightedPlaceIndex: index }),
  setFocusedMapPlace: (index) => set({ focusedMapPlaceIndex: index }),
  setSelectedDay: (date) => set({ selectedDay: date }),
}));

// Edicoes feitas com internet (trocar parada, anotar, ajustar) tambem vao para a copia salva.
useItineraryStore.subscribe((state, prev) => {
  if (offlineOwner == null || state.offline) return;
  if (state.itinerary === prev.itinerary && state.itineraries === prev.itineraries) return;
  writeOfflineCopy(offlineOwner, { itinerary: state.itinerary, itineraries: state.itineraries });
});
