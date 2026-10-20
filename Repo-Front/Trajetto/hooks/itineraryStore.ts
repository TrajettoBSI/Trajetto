import { create } from 'zustand';
import { AddPlaceRequest, ItineraryService, TravelPace } from '../services';
import { getErrorMessage } from '../utils/apiError';

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
}

type ItineraryStore = {
  itinerary: Itinerary | null;
  itineraries: Itinerary[];
  loading: boolean;
  error: string | null;
  highlightedPlaceIndex: number | null;
  focusedMapPlaceIndex: number | null;
  selectedDay: string | null;
  fetchItinerary: (userId: number) => Promise<void>;
  fetchAllItineraries: (userId: number) => Promise<void>;
  generateItinerary: (userId: number, startLat: number, startLng: number, startDate: string, days: number, pace: TravelPace, city?: string) => Promise<Itinerary>;
  acceptGeneratedItinerary: (itinerary: Itinerary) => void;
  activateItinerary: (itineraryId: number, userId: number) => Promise<void>;
  deleteItinerary: (itineraryId: number, userId: number) => Promise<void>;
  rateItinerary: (itineraryId: number, rating: number | null, ratingDescription: string | null) => Promise<void>;
  updateDate: (itineraryId: number, date: string | null) => Promise<void>;
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
  highlightedPlaceIndex: null,
  focusedMapPlaceIndex: null,
  selectedDay: null,

  fetchItinerary: async (userId: number) => {
    try {
      set({ loading: true, error: null });
      const data = await ItineraryService.getItinerary(userId);
      set({ itinerary: data?.id ? data : null, loading: false });
    } catch (e) {
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
      set({ itineraries: data, itinerary: active, loading: false });
    } catch (e) {
      set({ itineraries: [], itinerary: null, error: getErrorMessage(e), loading: false });
    }
  },

  generateItinerary: async (userId, startLat, startLng, startDate, days, pace, city) => {
    const data = await ItineraryService.generateItinerary(userId, startLat, startLng, startDate, days, pace, city);
    return data as Itinerary;
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
