import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useItineraryStore } from '@/hooks/itineraryStore';
import { PlaceSuggestion } from '@/services';
import { getErrorMessage } from '@/utils/apiError';
import { showAlert } from '@/src/components/alerts/alertService';
import { useDestinationCarousel } from '@/src/pages/tabs/shared/hooks/useDestinationCarousel';

export function useRoteiros() {
  const { t } = useTranslation('roteiros');
  const destIndex = useDestinationCarousel();

  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ openGenerate?: string }>();
  const { itinerary, itineraries, loading, error, deleteItinerary, activateItinerary } = useItineraryStore();
  const [deleting, setDeleting] = useState<number | null>(null);
  const [activating, setActivating] = useState<number | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generatePrefill, setGeneratePrefill] = useState<PlaceSuggestion | undefined>(undefined);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showAllInactive, setShowAllInactive] = useState(false);

  const userId = user?.id;

  const openGenerate = (prefill?: PlaceSuggestion) => {
    setGeneratePrefill(prefill);
    setShowGenerate(true);
  };

  useEffect(() => {
    if (params.openGenerate) {
      openGenerate();
      router.setParams({ openGenerate: undefined });
    }
  }, [params.openGenerate]);

  const reload = useCallback(() => {
    if (userId) useItineraryStore.getState().fetchAllItineraries(userId);
  }, [userId]);

  useFocusEffect(reload);

  const enterSelectMode = (id: number) => {
    setSelectMode(true);
    setSelectedIds(new Set([id]));
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  useEffect(() => {
    if (selectMode && itineraries.length === 0) {
      setSelectMode(false);
      setSelectedIds(new Set());
    }
  }, [itineraries.length, selectMode]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(itineraries.map((i) => i.id)));

  const handleDelete = (id: number) => {
    if (!user) return;
    showAlert(t('delete.confirmSingle'), {
      title: t('delete.titleSingle'),
      buttons: [
        { text: t('common:cancel'), style: 'cancel' },
        {
          text: t('common:delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(id);
              await deleteItinerary(id, user.id);
            } catch (e) {
              showAlert(getErrorMessage(e, t('delete.errorSingle')), { title: t('common:error') });
            } finally {
              setDeleting(null);
            }
          },
        },
      ],
    });
  };

  const handleBulkDelete = () => {
    if (!user || selectedIds.size === 0) return;
    showAlert(t('delete.confirmBulk', { count: selectedIds.size }), {
      title: t('delete.titleBulk'),
      buttons: [
        { text: t('common:cancel'), style: 'cancel' },
        {
          text: t('common:delete'),
          style: 'destructive',
          onPress: async () => {
            setBulkDeleting(true);
            try {
              if (!user) return;
              await Promise.all([...selectedIds].map((id) => deleteItinerary(id, user.id)));
              exitSelectMode();
            } catch (e) {
              showAlert(getErrorMessage(e, t('delete.errorBulk')), { title: t('common:error') });
            } finally {
              setBulkDeleting(false);
            }
          },
        },
      ],
    });
  };

  const handleActivate = async (id: number) => {
    if (!user) return;
    try {
      setActivating(id);
      await activateItinerary(id, user.id);
    } catch (e) {
      showAlert(getErrorMessage(e, t('activateError')), { title: t('common:error') });
    } finally {
      setActivating(null);
    }
  };

  return {
    destIndex,
    user,
    router,
    itinerary,
    itineraries,
    loading,
    error,
    reload,
    deleting,
    activating,
    showGenerate,
    setShowGenerate,
    generatePrefill,
    openGenerate,
    selectMode,
    selectedIds,
    bulkDeleting,
    showAllInactive,
    setShowAllInactive,
    enterSelectMode,
    exitSelectMode,
    toggleSelect,
    selectAll,
    handleDelete,
    handleBulkDelete,
    handleActivate,
  };
}
