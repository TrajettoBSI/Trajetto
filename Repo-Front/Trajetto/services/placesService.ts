import { api } from './api';

export interface Place {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  profiles: string[];
  openingHours: string;
  category: string;
  fee: string;
  phone?: string;
  website?: string;
  wikidata?: string;
  wikipedia?: string;
  wheelchair?: string;
  /** Site oficial de reserva, quando a atracao exige reservar antes. */
  bookingUrl?: string | null;
  /** Nome por idioma do app (pt, en, es), quando o lugar e do catalogo. */
  names?: Record<string, string> | null;
  /** Identificador usado pelas avaliacoes e pelos favoritos. */
  xid?: string;
}

export type NearbyPlace = Place & { distanceMeters?: number | null };

/** Lugar em destaque na tela inicial: popular no catalogo e bem avaliado. */
export interface PlaceHighlight {
  spot: Place;
  xid: string;
  /** Slug da cidade do catalogo. */
  city: string;
  /** Foto do Wikimedia Commons; nula quando o lugar nao tem. */
  imageUrl: string | null;
  average: number;
  ratingsCount: number;
  latestReview: { userName: string; rating: number; comment: string } | null;
}

export interface PlacesFilter {
  search?: string;
  category?: string;
  fee?: 'yes' | 'no' | '';
  hasHours?: boolean;
  profile?: string;
  lat?: number;
  lng?: number;
  maxDistance?: number;
}

export const placesService = {
  getAll: async (filter: PlacesFilter = {}): Promise<Place[]> => {
    const params: Record<string, any> = {};
    if (filter.search)       params.search      = filter.search;
    if (filter.category)     params.category    = filter.category;
    if (filter.fee)          params.fee         = filter.fee;
    if (filter.hasHours)     params.hasHours    = filter.hasHours;
    if (filter.profile)      params.profile     = filter.profile;
    if (filter.lat)          params.lat         = filter.lat;
    if (filter.lng)          params.lng         = filter.lng;
    if (filter.maxDistance)  params.maxDistance = filter.maxDistance;
    const res = await api.get('/places', { params });
    return res.data;
  },

  /** Foto do Wikimedia Commons pelo id do Wikidata; null quando o ponto nao tem foto. */
  getImage: async (wikidata: string): Promise<string | null> => {
    const res = await api.get('/places/image', { params: { wikidata } });
    return res.data?.url ?? null;
  },

  getHighlights: async (limit = 5): Promise<PlaceHighlight[]> => {
    const res = await api.get('/places/highlights', { params: { limit } });
    return res.data;
  },

  nearby: async (
    lat: number,
    lng: number,
    options: { radius?: number; limit?: number; category?: string } = {},
  ): Promise<NearbyPlace[]> => {
    const res = await api.get('/places/nearby', { params: { lat, lng, ...options } });
    return res.data;
  },

  getCategories: async (): Promise<string[]> => {
    const res = await api.get('/places/categories');
    return res.data;
  },

  getProfiles: async (): Promise<string[]> => {
    const res = await api.get('/places/profiles');
    return res.data;
  },
};