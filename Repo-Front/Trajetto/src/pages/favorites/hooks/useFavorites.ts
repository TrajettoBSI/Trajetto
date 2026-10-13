import { useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useFavoritesStore } from '@/hooks/favoritesStore';
import { FavoritePlace, placesService } from '@/services';

export function useFavorites() {
  const router = useRouter();
  const { user } = useAuth();
  const { favorites, loading, error, fetchFavorites } = useFavoritesStore();

  const userId = user?.id;
  const reload = useCallback(() => {
    if (userId) fetchFavorites(userId);
  }, [userId, fetchFavorites]);

  useEffect(() => {
    reload();
  }, [reload]);

  const openSpotDetail = useCallback(async (favorite: FavoritePlace) => {
    let spot: unknown = { ...favorite, category: favorite.category ?? '', address: favorite.address ?? '' };
    try {
      const results = await placesService.getAll({ search: favorite.name });
      const fullMatch = results.find((p) => p.name === favorite.name);
      if (fullMatch) spot = { ...fullMatch, xid: favorite.xid };
    } catch {}
    router.push({ pathname: '/SpotDetailScreen', params: { spot: JSON.stringify(spot), origin: 'favoritos' } });
  }, [router]);

  return { router, favorites, loading, error, reload, openSpotDetail };
}
