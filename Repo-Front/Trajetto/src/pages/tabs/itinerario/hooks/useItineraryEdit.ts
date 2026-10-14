import { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { Places, useItineraryStore } from '@/hooks/itineraryStore';
import { useFavoritesStore } from '@/hooks/favoritesStore';
import { showAlert } from '@/src/components/alerts/alertService';
import { getErrorMessage } from '@/utils/apiError';

export function useItineraryEdit(currentDate: string | null) {
  const { t } = useTranslation('itinerario');
  const { user } = useAuth();
  const { addPlace, removePlace, movePlace } = useItineraryStore();
  const { favorites, loading: loadingFavorites, ensureFavorites } = useFavoritesStore();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } catch (e) {
      showAlert(getErrorMessage(e, t('edit.error')));
    } finally {
      setBusy(false);
    }
  };

  const confirmRemove = (place: Places) => {
    Alert.alert(t('edit.removeTitle'), t('edit.removeMessage', { name: place.name }), [
      { text: t('edit.cancel'), style: 'cancel' },
      { text: t('edit.remove'), style: 'destructive', onPress: () => run(() => removePlace(place.orderIndex)) },
    ]);
  };

  const openFavorites = () => {
    if (user?.id) ensureFavorites(user.id);
    setShowFavorites(true);
  };

  const addFavorite = (xid: string | null) => {
    setShowFavorites(false);
    const favorite = favorites?.find((f) => f.xid === xid);
    if (!favorite) return;
    run(() => addPlace({
      xid: favorite.xid,
      name: favorite.name,
      address: favorite.address,
      latitude: favorite.latitude,
      longitude: favorite.longitude,
      category: favorite.category,
      visitDate: currentDate,
    }));
  };

  return {
    editing,
    toggleEditing: () => setEditing((v) => !v),
    busy,
    moveUp: (place: Places) => run(() => movePlace(place.orderIndex, 'UP')),
    moveDown: (place: Places) => run(() => movePlace(place.orderIndex, 'DOWN')),
    confirmRemove,
    showFavorites,
    openFavorites,
    closeFavorites: () => setShowFavorites(false),
    favoriteOptions: (favorites ?? []).map((f) => ({ value: f.xid, label: f.name })),
    loadingFavorites,
    addFavorite,
  };
}
