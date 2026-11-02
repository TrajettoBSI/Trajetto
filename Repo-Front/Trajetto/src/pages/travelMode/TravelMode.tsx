import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/src/theme';
import { usePlaceImage } from '@/hooks/usePlaceImage';
import { cityImage } from '@/src/helpers/cityImage';
import { formatDecimal, formatTime, formatWeekdayDayMonth, placeName } from '@/src/i18n/format';
import { WEATHER_ICONS, weatherKind } from '@/src/domain/weather/weatherInfo';
import NoItineraryEmptyState from '@/src/pages/tabs/shared/components/NoItineraryEmptyState/NoItineraryEmptyState';
import { useTravelMode } from './hooks/useTravelMode';
import { styles } from './styles/styles';

const pad = (n: number) => String(n).padStart(2, '0');

export default function TravelMode() {
  const { t } = useTranslation('itinerario');
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const s = styles(colors);
  const tm = useTravelMode();
  const photo = usePlaceImage(tm.focus?.wikidata);

  if (!tm.itinerary || !tm.progress) {
    return <NoItineraryEmptyState destIndex={0} title={t('travelMode.title')} />;
  }

  const { progress, focus } = tm;
  const total = progress.stops.length;
  const kind = tm.weather ? weatherKind(tm.weather.weatherCode) : null;
  const heroImage = photo ? { uri: photo } : cityImage(tm.itinerary.city) ?? undefined;

  const statusLabel = tm.focusIsCurrent
    ? t('travelMode.now')
    : progress.minutesToNext != null
      ? progress.minutesToNext >= 60
        ? t('travelMode.nextInHours', { hours: Math.floor(progress.minutesToNext / 60), minutes: pad(progress.minutesToNext % 60) })
        : t('travelMode.nextIn', { minutes: progress.minutesToNext })
      : t('travelMode.next');

  return (
    <View style={s.safe}>
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={tm.goBack} style={s.backBtn} accessibilityRole="button" accessibilityLabel={t('travelMode.back')}>
          <Ionicons name="chevron-back" size={22} color={colors.onPrimary} />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.headerTitle}>{t('travelMode.title')}</Text>
          <Text style={s.headerSub}>
            {t('travelMode.dayOf', { number: tm.dayNumber, total: tm.totalDays })} - {formatWeekdayDayMonth(progress.date)}
          </Text>
        </View>
        {kind && tm.weather && (
          <View style={s.weatherChip}>
            <Ionicons name={WEATHER_ICONS[kind] as never} size={16} color={colors.onPrimary} />
            <Text style={s.weatherText}>{Math.round(tm.weather.maxTemperature)}°</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        {tm.preview && (
          <View style={s.simCard}>
            <View style={s.simHeader}>
              <Ionicons name="play-circle" size={18} color={colors.primary} />
              <Text style={s.simTitle}>
                {tm.liveStatus === 'afterTrip' ? t('travelMode.previewAfter') : t('travelMode.previewBefore', { count: progress.daysUntilTrip })}
              </Text>
            </View>
            <Text style={s.simClock}>
              {t('travelMode.simulatedTime', { time: `${pad(tm.clock.getHours())}:${pad(tm.clock.getMinutes())}` })}
            </Text>
            <View style={s.simControls}>
              <TouchableOpacity style={s.simBtn} onPress={() => tm.changeSimDay(-1)} disabled={!tm.canPrevDay} accessibilityRole="button" accessibilityLabel={t('travelMode.prevDay')}>
                <Ionicons name="play-skip-back" size={16} color={tm.canPrevDay ? colors.primary : colors.borderMuted} />
              </TouchableOpacity>
              <TouchableOpacity style={s.simBtn} onPress={tm.stepBackSimulation}>
                <Text style={s.simBtnText}>-30 min</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.simBtn} onPress={tm.stepSimulation}>
                <Text style={s.simBtnText}>+30 min</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.simBtn, s.simBtnPrimary]} onPress={tm.jumpToNext}>
                <Text style={[s.simBtnText, s.simBtnTextPrimary]}>{t('travelMode.jumpNext')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.simBtn} onPress={() => tm.changeSimDay(1)} disabled={!tm.canNextDay} accessibilityRole="button" accessibilityLabel={t('travelMode.nextDay')}>
                <Ionicons name="play-skip-forward" size={16} color={tm.canNextDay ? colors.primary : colors.borderMuted} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={s.progressRow}>
          <Text style={s.progressText}>{t('travelMode.progress', { done: progress.doneCount, total })}</Text>
          <Text style={s.progressPercent}>{total ? Math.round((progress.doneCount / total) * 100) : 0}%</Text>
        </View>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${total ? (progress.doneCount / total) * 100 : 0}%` }]} />
        </View>

        {focus ? (
          <View style={s.hero}>
            <Image source={heroImage} style={s.heroImage} resizeMode="cover" />
            <View style={s.heroShade} />
            <View style={s.heroBody}>
              <View style={[s.statusPill, tm.focusIsCurrent && s.statusPillNow]}>
                <View style={[s.statusDot, tm.focusIsCurrent && s.statusDotNow]} />
                <Text style={s.statusText}>{statusLabel}</Text>
              </View>
              <Text style={s.heroName} numberOfLines={2}>{placeName(focus)}</Text>
              <Text style={s.heroMeta}>
                {formatTime(focus.estimatedVisitTime)}
                {tm.focusIsCurrent && tm.minutesLeftAtCurrent != null ? ` - ${t('travelMode.minutesLeft', { minutes: tm.minutesLeftAtCurrent })}` : ''}
              </Text>
            </View>
          </View>
        ) : (
          <View style={s.doneCard}>
            <Ionicons name="trophy" size={40} color={colors.primary} />
            <Text style={s.doneTitle}>{t('travelMode.dayDoneTitle')}</Text>
            <Text style={s.doneText}>{t('travelMode.dayDoneText')}</Text>
          </View>
        )}

        {focus && (
          <>
            {tm.distanceKm != null && tm.walkMinutes != null && (
              <View style={s.distanceRow}>
                <Ionicons name={tm.walkMinutes > 30 ? 'bus-outline' : 'walk'} size={20} color={colors.primary} />
                <Text style={s.distanceText}>
                  {t(tm.usingUserLocation ? 'travelMode.fromYou' : 'travelMode.fromPrevious', {
                    minutes: tm.walkMinutes, km: formatDecimal(tm.distanceKm),
                  })}
                </Text>
              </View>
            )}
            {focus.note ? (
              <View style={s.noteBox}>
                <Ionicons name="document-text-outline" size={16} color={colors.textMuted} />
                <Text style={s.noteText}>{focus.note}</Text>
              </View>
            ) : null}
            <View style={s.actions}>
              <TouchableOpacity style={[s.actionBtn, s.actionPrimary]} onPress={() => tm.openDirections(focus)} activeOpacity={0.85}>
                <Ionicons name="navigate" size={18} color={colors.onPrimary} />
                <Text style={[s.actionText, s.actionTextPrimary]}>{t('travelMode.directions')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.actionBtn} onPress={() => tm.openOnMap(focus)} activeOpacity={0.85}>
                <Ionicons name="map-outline" size={18} color={colors.primary} />
                <Text style={s.actionText}>{t('travelMode.onMap')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.actionBtn} onPress={() => tm.complete(focus)} activeOpacity={0.85}>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
                <Text style={s.actionText}>{t('travelMode.complete')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={s.sectionLabel}>{t('travelMode.today')}</Text>
        {progress.stops.map((stop, i) => {
          const done = progress.done[i];
          const isFocus = focus?.orderIndex === stop.orderIndex;
          return (
            <View key={stop.orderIndex} style={[s.stopRow, isFocus && s.stopRowFocus]}>
              <Ionicons
                name={done ? 'checkmark-circle' : isFocus ? 'radio-button-on' : 'ellipse-outline'}
                size={20}
                color={done ? colors.successText : isFocus ? colors.primary : colors.borderMuted}
              />
              <Text style={[s.stopTime, done && s.stopDone]}>{formatTime(stop.estimatedVisitTime)}</Text>
              <Text style={[s.stopName, done && s.stopDone]} numberOfLines={1}>{placeName(stop)}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
