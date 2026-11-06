import React, { useEffect } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Itinerary } from '@/hooks/itineraryStore';
import StopDot from '@/src/components/brand/StopDot';
import PressableScale from '@/src/components/motion/PressableScale';
import PulseDot from '@/src/components/motion/PulseDot';
import { placeColor, useColors } from '@/src/theme';
import { isPlacePast } from '@/app/utils/isPlacePast';
import { groupByDay, placeDate, resolveDay, toIsoDate } from '@/src/domain/itinerary/itineraryDays';
import { formatDate, formatTime, itineraryTitle, placeName } from '@/src/i18n/format';
import { cityImage } from '@/src/helpers/cityImage';
import Checkbox from '../Checkbox/Checkbox';
import { styles } from './styles';

type ActiveItineraryCardProps = {
  itinerary: Itinerary;
  selectMode: boolean;
  selected: boolean;
  deleting: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onDelete: () => void;
};

export default function ActiveItineraryCard({
  itinerary, selectMode, selected, deleting, onPress, onLongPress, onDelete,
}: ActiveItineraryCardProps) {
  const { t } = useTranslation('roteiros');
  const colors = useColors();
  const s = styles(colors);

  const days = Math.ceil(
    (new Date(itinerary.endDate).getTime() - new Date(itinerary.startDate).getTime()) /
    (1000 * 60 * 60 * 24)
  ) + 1;

  const places = itinerary.places ?? [];
  const doneCount = places.filter((p) => isPlacePast(placeDate(itinerary.startDate, p), p.estimatedVisitTime)).length;
  const itineraryDays = groupByDay(itinerary.startDate, places, itinerary.endDate);
  const todayDate = resolveDay(itineraryDays.map((d) => d.date), null, toIsoDate(new Date()));
  const shownDay = itineraryDays.find((d) => d.date === todayDate);
  const shownPlaces = shownDay?.places ?? [];
  const progress = places.length > 0 ? Math.round((doneCount / places.length) * 100) : 0;
  const image = cityImage(itinerary.city);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withDelay(250, withTiming(progress, { duration: 800, easing: Easing.out(Easing.cubic) }));
  }, [progress, progressWidth]);

  const progressStyle = useAnimatedStyle(() => ({ width: `${progressWidth.value}%` }));
  const dates = `${formatDate(itinerary.startDate)} → ${formatDate(itinerary.endDate)}`;

  return (
    <PressableScale
      style={[s.itineraryCard, selectMode && selected && s.cardSelected]}
      onPress={onPress}
      onLongPress={onLongPress}
      scaleTo={0.985}
    >
      {selectMode && (
        <View style={s.checkboxRow}>
          <Checkbox selected={selected} />
        </View>
      )}
      {image ? (
        <View style={s.hero}>
          <Image source={image} style={s.heroImage} contentFit="cover" transition={280} />
          <LinearGradient colors={[colors.scrimStart, colors.scrimEnd]} style={s.heroScrim} />
          <View style={s.heroTop}>
            <View style={s.heroBadge}>
              <PulseDot color={colors.activeDotGreen} />
              <Text style={s.heroBadgeText}>{t('activeCard.activeBadge')}</Text>
            </View>
          </View>
          <View style={s.heroBottom}>
            <Text style={s.heroTitle} numberOfLines={2}>{itineraryTitle(itinerary)}</Text>
            <View style={s.heroMeta}>
              <Ionicons name="calendar-outline" size={13} color={colors.onPrimary} />
              <Text style={s.heroDates}>{dates}</Text>
            </View>
          </View>
        </View>
      ) : (
        <>
          <View style={s.itineraryCardHeader}>
            <View style={s.activeBadge}>
              <PulseDot color={colors.successStrong} />
              <Text style={s.activeBadgeText}>{t('activeCard.activeBadge')}</Text>
            </View>
            <Text style={s.itineraryDates}>{dates}</Text>
          </View>

          <View style={s.titleRow}>
            <Ionicons name="location" size={18} color={colors.primaryText} style={s.locationIcon} />
            <Text style={s.itineraryCardTitle} numberOfLines={1}>
              {itineraryTitle(itinerary)}
            </Text>
            {!selectMode && <Text style={s.chevron}>›</Text>}
          </View>
        </>
      )}

      <View style={s.progressRow}>
        <Text style={s.itineraryCardSub}>
          {t('activeCard.stopsAndDays', { stops: places.length, days })}
        </Text>
        <View style={s.progressPercentBlock}>
          <Text style={s.progressPercentText}>{t('activeCard.progressPercent', { percent: progress })}</Text>
          <Text style={s.progressDoneText}>{t('activeCard.progressDone')}</Text>
        </View>
      </View>
      <View style={s.progressTrack}>
        <Animated.View style={[s.progressFill, progressStyle]}>
          <LinearGradient colors={colors.gradientProgress} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.progressGradient} />
        </Animated.View>
      </View>

      {!selectMode && itineraryDays.length > 1 && shownDay && (
        <Text style={s.dayLabel}>
          {t('activeCard.dayOf', { number: shownDay.number, total: itineraryDays.length })}
        </Text>
      )}

      {!selectMode && (
        <View style={s.timeline}>
          {shownPlaces
            .map((place, idx) => {
              const isPast = isPlacePast(placeDate(itinerary.startDate, place), place.estimatedVisitTime);
              return (
                <Animated.View key={idx} style={s.timelineItem} entering={FadeInDown.delay(Math.min(idx, 5) * 60 + 150).duration(320)}>
                  <View style={s.timelineLeft}>
                    <StopDot index={idx} past={isPast} />
                    {idx < shownPlaces.length - 1 && <View style={s.timelineLine} />}
                  </View>
                  <View style={[s.timelineContent, isPast && s.timelineContentPast]}>
                    <Text style={[s.timelineTime, { color: isPast ? colors.textSubtle : placeColor(colors, idx) }]}>{formatTime(place.estimatedVisitTime)}</Text>
                    <Text style={s.timelineName} numberOfLines={1}>{placeName(place)}</Text>
                    <Text style={s.timelineAddress} numberOfLines={1}>{place.address}</Text>
                  </View>
                </Animated.View>
              );
            })}
        </View>
      )}

      {!selectMode && <View style={s.divider} />}
      {!selectMode && (
        <View style={s.buttonRow}>
          <TouchableOpacity style={s.openBtn} onPress={onPress} activeOpacity={0.8}>
            <Text style={s.openBtnText}>{t('activeCard.openButton')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.deleteBtn}
            onPress={onDelete}
            disabled={deleting}
            activeOpacity={0.8}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={colors.error} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={18} color={colors.error} />
                <Text style={s.deleteBtnText}>{t('activeCard.deleteButton')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </PressableScale>
  );
}
