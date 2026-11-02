import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Places, useItineraryStore } from '@/hooks/itineraryStore';
import { useItineraryWeather } from '@/src/pages/tabs/shared/hooks/useItineraryWeather';
import { groupByDay } from '@/src/domain/itinerary/itineraryDays';
import { haversineKm, simulatedNow, travelProgress, VISIT_MINUTES, walkingMinutes } from '@/src/domain/travel/travelProgress';

const TICK_MS = 30000;
const SIM_STEP_MINUTES = 30;
const SIM_LEAD_MINUTES = 20;

type Coords = { latitude: number; longitude: number };

export function useTravelMode() {
  const router = useRouter();
  const itinerary = useItineraryStore((state) => state.itinerary);
  const setSelectedDay = useItineraryStore((state) => state.setSelectedDay);
  const setFocusedMapPlace = useItineraryStore((state) => state.setFocusedMapPlace);
  const weatherByDate = useItineraryWeather(itinerary);

  const [now, setNow] = useState(() => new Date());
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [simDayIndex, setSimDayIndex] = useState(0);
  const [simOffset, setSimOffset] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      if (active) setUserCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })().catch(() => {});
    return () => { active = false; };
  }, []);

  const places = useMemo(() => itinerary?.places ?? [], [itinerary]);
  const days = useMemo(
    () => (itinerary ? groupByDay(itinerary.startDate, places, itinerary.endDate).filter((d) => d.places.length > 0) : []),
    [itinerary, places],
  );

  const live = itinerary ? travelProgress(itinerary.startDate, itinerary.endDate, places, now, visited) : null;
  const preview = !live || live.status === 'beforeTrip' || live.status === 'afterTrip';

  const simDay = days[Math.min(simDayIndex, Math.max(0, days.length - 1))];
  const firstTime = simDay
    ? [...simDay.places].sort((a, b) => a.estimatedVisitTime.localeCompare(b.estimatedVisitTime))[0]?.estimatedVisitTime
    : undefined;
  const clock = preview && simDay && firstTime
    ? simulatedNow(simDay.date, firstTime, simOffset - SIM_LEAD_MINUTES)
    : now;

  const progress = itinerary
    ? travelProgress(simDay && preview ? simDay.date : itinerary.startDate, preview ? simDay?.date : itinerary.endDate,
      preview && simDay ? simDay.places : places, clock, visited)
    : null;

  const focusIndex = progress ? progress.currentIndex ?? progress.nextIndex : null;
  const focus: Places | null = progress && focusIndex != null ? progress.stops[focusIndex] : null;

  const previousCoords: Coords | null = progress && focusIndex != null && focusIndex > 0
    ? { latitude: progress.stops[focusIndex - 1].latitude, longitude: progress.stops[focusIndex - 1].longitude }
    : itinerary?.originLatitude != null && itinerary?.originLongitude != null
      ? { latitude: itinerary.originLatitude, longitude: itinerary.originLongitude }
      : null;
  const from = !preview && userCoords ? userCoords : previousCoords;
  const distanceKm = focus && from ? haversineKm(from.latitude, from.longitude, focus.latitude, focus.longitude) : null;

  const complete = useCallback((place: Places) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setVisited((prev) => new Set(prev).add(place.orderIndex));
  }, []);

  const openDirections = useCallback((place: Places) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&travelmode=walking`;
    Linking.openURL(url).catch(() => {});
  }, []);

  const openOnMap = (place: Places) => {
    if (!progress) return;
    const dayPlaces = days.find((d) => d.date === progress.date)?.places ?? [];
    setSelectedDay(progress.date);
    setFocusedMapPlace(Math.max(0, dayPlaces.findIndex((p) => p.orderIndex === place.orderIndex)));
    router.push({ pathname: '/mapa', params: { from: 'itinerario' } });
  };

  const stepSimulation = (minutes: number) => setSimOffset((o) => Math.max(0, o + minutes));

  const jumpToNext = () => {
    if (!progress || focusIndex == null) return;
    const target = progress.stops[focusIndex + (progress.currentIndex != null ? 1 : 0)];
    if (!target || !firstTime) return;
    const [h, m] = target.estimatedVisitTime.split(':').map(Number);
    const [fh, fm] = firstTime.split(':').map(Number);
    setSimOffset(h * 60 + m - (fh * 60 + fm) + SIM_LEAD_MINUTES + 1);
  };

  const changeSimDay = (delta: number) => {
    setSimDayIndex((i) => Math.min(Math.max(0, i + delta), Math.max(0, days.length - 1)));
    setSimOffset(0);
    setVisited(new Set());
  };

  return {
    itinerary,
    progress,
    preview,
    liveStatus: live?.status ?? null,
    dayNumber: preview && simDay ? simDay.number : progress?.dayNumber ?? 1,
    totalDays: preview ? days.length : progress?.totalDays ?? 1,
    clock,
    focus,
    focusIsCurrent: progress?.currentIndex != null,
    minutesLeftAtCurrent: progress?.currentIndex != null && focus
      ? Math.max(0, VISIT_MINUTES - Math.round((clock.getHours() * 60 + clock.getMinutes())
        - (Number(focus.estimatedVisitTime.slice(0, 2)) * 60 + Number(focus.estimatedVisitTime.slice(3, 5)))))
      : null,
    distanceKm,
    walkMinutes: distanceKm != null ? walkingMinutes(distanceKm) : null,
    usingUserLocation: !preview && !!userCoords,
    weather: progress ? weatherByDate[progress.date] ?? null : null,
    canPrevDay: simDayIndex > 0,
    canNextDay: simDayIndex < days.length - 1,
    complete,
    openDirections,
    openOnMap,
    stepSimulation: () => stepSimulation(SIM_STEP_MINUTES),
    stepBackSimulation: () => stepSimulation(-SIM_STEP_MINUTES),
    jumpToNext,
    changeSimDay,
    goBack: () => router.back(),
  };
}
