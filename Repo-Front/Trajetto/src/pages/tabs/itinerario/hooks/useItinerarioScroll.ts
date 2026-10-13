import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Places, useItineraryStore } from '@/hooks/itineraryStore';
import { isPlacePast } from '@/app/utils/isPlacePast';
import { placeDate } from '@/src/domain/itinerary/itineraryDays';

export function useItinerarioScroll(places: Places[], startDate: string | undefined) {
  const { highlightedPlaceIndex, setHighlightedPlace } = useItineraryStore();
  const [layoutReady, setLayoutReady] = useState(false);
  const [placesAnteriores, setPlacesAnteriores] = useState(places);
  const scrollRef = useRef<ScrollView>(null);
  const cardOffsets = useRef<Record<number, number>>({});

  if (places !== placesAnteriores) {
    setPlacesAnteriores(places);
    setLayoutReady(false);
  }

  const registerCardOffset = (orderIndex: number, y: number) => {
    cardOffsets.current[orderIndex] = y;
    if (places.every((p) => cardOffsets.current[p.orderIndex] !== undefined)) setLayoutReady(true);
  };

  // Rola ate o card destacado ao voltar do mapa
  useEffect(() => {
    if (highlightedPlaceIndex === null) return;
    const offset = cardOffsets.current[highlightedPlaceIndex];
    if (offset !== undefined) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, offset - 20), animated: true });
      }, 100);
    }
    const timer = setTimeout(() => setHighlightedPlace(null), 800);
    return () => clearTimeout(timer);
  }, [highlightedPlaceIndex, setHighlightedPlace]);

  useFocusEffect(
    useCallback(() => {
      if (!layoutReady || !startDate || !places.length) return;

      const firstUpcoming = places.find(
        (place) => !isPlacePast(placeDate(startDate, place), place.estimatedVisitTime)
      );
      if (!firstUpcoming) return;

      requestAnimationFrame(() => {
        const offset = cardOffsets.current[firstUpcoming.orderIndex];
        if (offset == null) return;
        scrollRef.current?.scrollTo({ y: Math.max(0, offset - 100), animated: true });
      });
    }, [layoutReady, places, startDate])
  );

  return { scrollRef, highlightedPlaceIndex, registerCardOffset };
}
