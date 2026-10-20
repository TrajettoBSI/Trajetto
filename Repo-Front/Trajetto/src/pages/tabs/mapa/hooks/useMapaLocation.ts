import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';
import polyline from '@mapbox/polyline';
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming, cancelAnimation } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { useItineraryStore } from '@/hooks/itineraryStore';
import { RouteService } from '@/services';
import { isPlacePast } from '@/app/utils/isPlacePast';
import { placeDate } from '@/src/domain/itinerary/itineraryDays';
import { useItineraryDay } from '@/src/pages/tabs/shared/hooks/useItineraryDay';
import { LatLng, Region, splitRoute } from '../mapaFormat';

export function useMapaLocation() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    itinerary, loading, error, fetchItinerary,
    focusedMapPlaceIndex, setFocusedMapPlace,
  } = useItineraryStore();

  const userId = user?.id;
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [segments, setSegments] = useState<LatLng[][]>([]);
  const { days, currentDay, dayPlaces, selectDay } = useItineraryDay(itinerary);
  const points: any[] = dayPlaces;
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const mapRef = useRef<MapView>(null);
  const isFocusingPin = useRef(false);

  const pulseAnim = useSharedValue(0);
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseAnim.value,
    transform: [{ scale: 1 + pulseAnim.value * 0.6 }],
  }));

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setRegion({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
    })();
  }, []);

  useEffect(() => {
    if (!points.length) return;
    const timeout = setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        points.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
        { edgePadding: { top: 120, bottom: 80, left: 80, right: 80 }, animated: true }
      );
    }, 400);
    return () => clearTimeout(timeout);
  }, [points]);

  useEffect(() => {
    if (!user?.id) return;
    if (!itinerary) fetchItinerary(user.id);
  }, [user, itinerary, fetchItinerary]);

  const originLatitude = itinerary?.originLatitude;
  const originLongitude = itinerary?.originLongitude;

  useEffect(() => {
    if (!dayPlaces.length) return;
    const sorted = dayPlaces;

    let cancelled = false;

    (async () => {
      if (sorted.length > 0) {
        setRegion((prev) => ({
          ...(prev ?? { latitudeDelta: 0.06, longitudeDelta: 0.06 }),
          latitude: sorted[0].latitude,
          longitude: sorted[0].longitude,
        }));
      }

      const stops: LatLng[] = [
        ...(originLatitude != null ? [{ latitude: originLatitude, longitude: originLongitude! }] : []),
        ...sorted.map((p: any) => ({ latitude: p.latitude, longitude: p.longitude })),
      ];
      if (stops.length < 2) {
        if (!cancelled) setSegments([]);
        return;
      }

      // Uma rota so para o dia inteiro, com as paradas no meio: um pedido por trecho
      // estourava o limite de consultas do OpenRouteService.
      const toCoord = (s: LatLng) => ({ lat: s.latitude, lng: s.longitude });
      const result = await RouteService.getRoute({
        origin: toCoord(stops[0]),
        destination: toCoord(stops[stops.length - 1]),
        waypoints: stops.slice(1, -1).map(toCoord),
      })
        .then((data) => splitRoute(
          stops,
          polyline.decode(data.geometry).map(([lat, lng]: number[]) => ({ latitude: lat, longitude: lng })),
          data.wayPoints,
        ))
        .catch(() => splitRoute(stops, null));

      if (!cancelled) setSegments(result);
    })();

    return () => { cancelled = true; };
  }, [dayPlaces, originLatitude, originLongitude]);

  const sorted = dayPlaces;
  const firstUpcomingIdx = itinerary
    ? sorted.findIndex((p) => !isPlacePast(placeDate(itinerary.startDate, p), p.estimatedVisitTime))
    : 0;
  const hasOriginSeg = itinerary?.originLatitude != null;
  const currentSegIdx = hasOriginSeg
    ? (firstUpcomingIdx >= 0 ? firstUpcomingIdx : -1)
    : (firstUpcomingIdx > 0 ? firstUpcomingIdx - 1 : -1);
  const currentSegCoords = currentSegIdx >= 0 ? (segments[currentSegIdx] ?? []) : [];

  useEffect(() => {
    pulseAnim.set(withRepeat(withTiming(1, { duration: 900 }), -1, true));
    return () => cancelAnimation(pulseAnim);
  }, [pulseAnim]);

  useEffect(() => {
    if (!points.length || focusedMapPlaceIndex === null) return;
    const point = points[focusedMapPlaceIndex];
    isFocusingPin.current = true;
    setTimeout(() => {
      mapRef.current?.animateToRegion({ latitude: point.latitude, longitude: point.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 600);
    }, 100);
    const timer = setTimeout(() => { setFocusedMapPlace(null); isFocusingPin.current = false; }, 1200);
    return () => clearTimeout(timer);
  }, [focusedMapPlaceIndex, points, setFocusedMapPlace]);

  const handlePinPress = (index: number) => {
    router.push({ pathname: '/SpotDetailScreen', params: { spot: JSON.stringify(points[index]), origin: 'mapa' } });
  };

  const reload = useCallback(() => {
    if (userId) fetchItinerary(userId);
  }, [userId, fetchItinerary]);

  return {
    itinerary,
    loading,
    error,
    reload,
    region,
    segments,
    points,
    userLocation,
    mapRef,
    pulseStyle,
    sorted,
    days,
    currentDay,
    selectDay,
    firstUpcomingIdx,
    hasOriginSeg,
    currentSegIdx,
    currentSegCoords,
    handlePinPress,
  };
}
