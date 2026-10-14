import { useEffect, useState } from 'react';
import { useMapaLocation } from './useMapaLocation';
import { useMapaSearch } from './useMapaSearch';
import { useMapaFilters } from './useMapaFilters';
import { useMapaNavigation } from './useMapaNavigation';
import { haversineMeters } from '../mapaFormat';

export function useMapa() {
  const location = useMapaLocation();
  const search = useMapaSearch(location.mapRef, location.userLocation);
  const filters = useMapaFilters(search.search, search.doSearch);
  const start = location.itinerary?.originLatitude != null && location.itinerary?.originLongitude != null
    ? { lat: location.itinerary.originLatitude, lng: location.itinerary.originLongitude }
    : null;
  const navigation = useMapaNavigation(location.points, location.userLocation, start, location.firstUpcomingIdx);

  const fromLat = navigation.origin?.coord.lat;
  const fromLng = navigation.origin?.coord.lng;
  const legTo = navigation.dest;
  const { mapRef } = location;
  useEffect(() => {
    if (fromLat == null || fromLng == null || !legTo) return;
    mapRef.current?.fitToCoordinates(
      [{ latitude: fromLat, longitude: fromLng }, { latitude: legTo.latitude, longitude: legTo.longitude }],
      { edgePadding: { top: 180, bottom: 420, left: 60, right: 60 }, animated: true },
    );
  }, [fromLat, fromLng, legTo, mapRef]);

  // Ao contrario do carousel de Roteiros/Itinerario, este destIndex nao roda
  // sozinho (sem setInterval) — mesmo comportamento do mapa.tsx original.
  const [destIndex] = useState(0);

  const spotDistance = search.selectedSpot && location.userLocation
    ? haversineMeters(
        location.userLocation.latitude,
        location.userLocation.longitude,
        search.selectedSpot.latitude,
        search.selectedSpot.longitude,
      )
    : null;

  return {
    ...location,
    ...search,
    ...filters,
    destIndex,
    spotDistance,
    navigation,
    handleSearchChange: (text: string) => search.handleSearchChange(text, filters.activeFilter),
  };
}
