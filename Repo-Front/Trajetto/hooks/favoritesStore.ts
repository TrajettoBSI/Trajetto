import { create } from 'zustand';
import { favoriteService, FavoritePlace, FavoritePlaceRequest } from '../services';
import { getErrorMessage } from '../utils/apiError';

type FavoritesStore = {
  ownerId: number | null;
  favorites: FavoritePlace[] | null;
  loading: boolean;
  error: string | null;
  fetchFavorites: (userId: number) => Promise<void>;
  ensureFavorites: (userId: number) => Promise<void>;
  toggleFavorite: (place: FavoritePlaceRequest) => Promise<void>;
};

export const findFavorite = (favorites: FavoritePlace[] | null, name: string) =>
  favorites?.find((f) => f.name === name.trim()) ?? null;

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  ownerId: null,
  favorites: null,
  loading: false,
  error: null,

  fetchFavorites: async (userId) => {
    try {
      set({ loading: true, error: null, ownerId: userId });
      const data = await favoriteService.list();
      set({ favorites: data, loading: false });
    } catch (e) {
      set({ favorites: null, error: getErrorMessage(e), loading: false });
    }
  },

  ensureFavorites: async (userId) => {
    const { ownerId, favorites, loading } = get();
    if (loading || (ownerId === userId && favorites)) return;
    await get().fetchFavorites(userId);
  },

  toggleFavorite: async (place) => {
    const existing = findFavorite(get().favorites, place.name);
    if (existing) {
      await favoriteService.unmark(existing.xid);
      set((state) => ({ favorites: (state.favorites ?? []).filter((f) => f.xid !== existing.xid) }));
    } else {
      const created = await favoriteService.mark(place);
      set((state) => ({
        favorites: [created, ...(state.favorites ?? []).filter((f) => f.xid !== created.xid)],
      }));
    }
  },
}));
