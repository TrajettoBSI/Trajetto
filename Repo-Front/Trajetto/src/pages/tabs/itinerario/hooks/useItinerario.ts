import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useItineraryStore, Places } from '@/hooks/itineraryStore';
import { placesService } from '@/services';
import { useDestinationCarousel } from '@/src/pages/tabs/shared/hooks/useDestinationCarousel';
import { useAlternatives } from './useAlternatives';
import { useExportPdf } from './useExportPdf';
import { useItinerarioScroll } from './useItinerarioScroll';

export function useItinerario() {
  const router = useRouter();
  const destIndex = useDestinationCarousel();
  const { user } = useAuth();
  const { itinerary, loading, error, setFocusedMapPlace } = useItineraryStore();

  const userId = user?.id;
  const reload = useCallback(() => {
    if (userId) useItineraryStore.getState().fetchAllItineraries(userId);
  }, [userId]);

  const alternatives = useAlternatives(itinerary);
  const { handleExportPDF } = useExportPdf();
  const { scrollRef, highlightedPlaceIndex, registerCardOffset } = useItinerarioScroll(itinerary);

  // O roteiro guarda so um recorte do lugar (sem telefone, site, etc.), mas carrega o xid
  // original (usado pra avaliacao). Busca o registro completo pra tela ficar igual a quando
  // se pesquisa direto no Explorar, sem perder o xid que so o recorte do roteiro tem.
  const openSpotDetail = useCallback(async (place: Places) => {
    const xid = (place as Places & { xid?: string }).xid;
    let spot: unknown = place;
    try {
      const results = await placesService.getAll({ search: place.name });
      const fullMatch = results.find((p) => p.name === place.name) ?? results[0];
      if (fullMatch) spot = { ...fullMatch, xid };
    } catch {
      // mantem o recorte do roteiro como fallback
    }
    router.push({ pathname: '/SpotDetailScreen', params: { spot: JSON.stringify(spot), origin: 'itinerario' } });
  }, [router]);

  return {
    router,
    destIndex,
    itinerary,
    loading,
    error,
    reload,
    setFocusedMapPlace,
    scrollRef,
    highlightedPlaceIndex,
    registerCardOffset,
    ...alternatives,
    openSpotDetail,
    handleExportPDF: () => handleExportPDF(itinerary),
  };
}
