import { api } from './api';

export interface FavoritePlace {
  id: number;
  xid: string;
  name: string;
  address?: string | null;
  category?: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface FavoritePlaceRequest {
  name: string;
  address?: string | null;
  category?: string | null;
  latitude: number;
  longitude: number;
}

export const favoriteService = {
  list: async (): Promise<FavoritePlace[]> => {
    const response = await api.get('/favorites');
    return response.data;
  },

  mark: async (place: FavoritePlaceRequest): Promise<FavoritePlace> => {
    const response = await api.post('/favorites', place);
    return response.data;
  },

  unmark: async (xid: string): Promise<void> => {
    await api.delete(`/favorites/${encodeURIComponent(xid)}`);
  },
};
