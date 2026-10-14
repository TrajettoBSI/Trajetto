import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';
import { useTranslation } from 'react-i18next';
import { Directions, RouteService, TravelMode } from '@/services';
import { getErrorMessage } from '@/utils/apiError';
import {
  distanceMeters, googleMapsUrl, legOrigin, NavPoint, optionFor, remainingOf,
} from '@/src/domain/navigation/navigation';
import { LatLng } from '../mapaFormat';

type Start = { lat: number; lng: number } | null;

export function useMapaNavigation(points: NavPoint[], userLocation: LatLng | null, start: Start, firstUpcomingIdx: number) {
  const { t, i18n } = useTranslation('mapa');
  const [active, setActive] = useState(false);
  const [legIndex, setLegIndex] = useState(0);
  const [directions, setDirections] = useState<Directions | null>(null);
  const [mode, setMode] = useState<TravelMode>('WALK');
  const [error, setError] = useState('');
  const [livePosition, setLivePosition] = useState<LatLng | null>(null);
  const [straightAtStart, setStraightAtStart] = useState(0);
  // Momento da ultima medicao (rota recebida ou nova posicao), base da hora prevista de chegada.
  const [measuredAt, setMeasuredAt] = useState(0);
  const [attempt, setAttempt] = useState(0);

  const position = livePosition ?? userLocation;
  const finished = active && legIndex >= points.length;
  const dest = points[legIndex] ?? null;
  const origin = active && dest ? legOrigin(legIndex, points, position, start) : null;
  const originKind = origin?.kind;

  useEffect(() => {
    if (!active || !dest || !origin) return undefined;
    let cancelled = false;
    const language = (i18n.language || 'pt').slice(0, 2);
    RouteService.getDirections(origin.coord, { lat: dest.latitude, lng: dest.longitude }, language, new Date().getHours())
      .then((d) => {
        if (cancelled) return;
        setDirections(d);
        setMode(d.recommended);
        setStraightAtStart(distanceMeters(origin.coord, { lat: dest.latitude, lng: dest.longitude }));
        setMeasuredAt(Date.now());
      })
      .catch((e) => { if (!cancelled) setError(getErrorMessage(e, t('navigation.error'))); });
    return () => { cancelled = true; };
    // O trecho so muda quando muda a parada de destino ou o tipo de partida; a posicao ao vivo
    // atualiza o "falta" sem pedir a rota de novo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, legIndex, originKind, attempt]);

  useEffect(() => {
    if (!active || !origin?.live) return undefined;
    let subscription: { remove: () => void } | null = null;
    let cancelled = false;
    Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced, distanceInterval: 15 }, (loc) => {
      setLivePosition({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setMeasuredAt(Date.now());
    }).then((sub) => {
      if (cancelled) sub.remove();
      else subscription = sub;
    }).catch(() => undefined);
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [active, origin?.live]);

  const startNavigation = useCallback(() => {
    setLegIndex(firstUpcomingIdx >= 0 && firstUpcomingIdx < points.length ? firstUpcomingIdx : 0);
    setDirections(null);
    setError('');
    setActive(true);
  }, [firstUpcomingIdx, points.length]);

  const stopNavigation = useCallback(() => {
    setActive(false);
    setDirections(null);
    setLivePosition(null);
  }, []);

  const nextLeg = useCallback(() => {
    setDirections(null);
    setError('');
    setLegIndex((i) => i + 1);
  }, []);

  const option = directions ? optionFor(mode, directions) : null;
  const straightNow = origin?.live && position && dest
    ? distanceMeters({ lat: position.latitude, lng: position.longitude }, { lat: dest.latitude, lng: dest.longitude })
    : null;
  const remaining = option ? remainingOf(option, straightAtStart, straightNow) : null;
  const arrival = remaining && measuredAt ? new Date(measuredAt + remaining.duration * 1000) : null;
  const geometry = option?.geometry ?? null;
  const routeCoords = useMemo<LatLng[]>(
    () => (geometry ? polyline.decode(geometry).map(([latitude, longitude]: number[]) => ({ latitude, longitude })) : []),
    [geometry],
  );

  const openExternal = () => {
    if (!origin || !dest) return;
    Linking.openURL(googleMapsUrl(origin.coord, { lat: dest.latitude, lng: dest.longitude }, mode)).catch(() => undefined);
  };

  return {
    active,
    finished,
    legIndex,
    total: points.length,
    dest,
    origin,
    directions,
    mode,
    setMode,
    option,
    remaining,
    arrival,
    routeCoords,
    loading: active && !finished && !directions && !error,
    error,
    retry: () => {
      setError('');
      setAttempt((n) => n + 1);
    },
    startNavigation,
    stopNavigation,
    nextLeg,
    openExternal,
  };
}

export type MapaNavigation = ReturnType<typeof useMapaNavigation>;
