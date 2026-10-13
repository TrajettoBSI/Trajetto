import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { findFavorite, useFavoritesStore } from '@/hooks/favoritesStore';
import { Place } from '@/services';
import { showAlert } from '@/src/components/alerts/alertService';
import { getErrorMessage } from '@/utils/apiError';

export function useSpotFavorite(spot: Place) {
  const { t } = useTranslation(['spotDetail', 'common']);
  const { user } = useAuth();
  const { favorites, ensureFavorites, toggleFavorite } = useFavoritesStore();
  const [saving, setSaving] = useState(false);

  const userId = user?.id;
  useEffect(() => {
    if (userId) ensureFavorites(userId);
  }, [userId, ensureFavorites]);

  const isFavorite = findFavorite(favorites, spot.name) !== null;

  const toggle = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await toggleFavorite({
        name: spot.name,
        address: spot.address,
        category: spot.category,
        latitude: spot.latitude,
        longitude: spot.longitude,
      });
    } catch (e) {
      showAlert(getErrorMessage(e, t('spotDetail:favorite.error')), { title: t('common:error') });
    } finally {
      setSaving(false);
    }
  };

  return { isFavorite, savingFavorite: saving, toggleFavorite: toggle };
}
