import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Itinerary } from '@/hooks/itineraryStore';
import { useColors } from '@/src/theme';
import { isPlacePast } from '@/app/utils/isPlacePast';
import { formatDate, formatTime } from '@/src/i18n/format';
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
  const doneCount = places.filter((p) => isPlacePast(itinerary.startDate, p.estimatedVisitTime)).length;
  const progress = places.length > 0 ? Math.round((doneCount / places.length) * 100) : 0;

  return (
    <TouchableOpacity
      style={[s.itineraryCard, selectMode && selected && s.cardSelected]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.9}
    >
      {selectMode && (
        <View style={s.checkboxRow}>
          <Checkbox selected={selected} />
        </View>
      )}
      <View style={s.itineraryCardHeader}>
        <View style={s.activeBadge}>
          <View style={s.activeDot} />
          <Text style={s.activeBadgeText}>{t('activeCard.activeBadge')}</Text>
        </View>
        <Text style={s.itineraryDates}>
          {formatDate(itinerary.startDate)} → {formatDate(itinerary.endDate)}
        </Text>
      </View>

      <View style={s.titleRow}>
        <Ionicons name="location" size={18} color={colors.primary} style={s.locationIcon} />
        <Text style={s.itineraryCardTitle} numberOfLines={1}>
          {places[0]?.name ?? t('defaultItineraryName')}
        </Text>
        {!selectMode && <Text style={s.chevron}>›</Text>}
      </View>

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
        <View style={[s.progressFill, { width: `${progress}%` }]} />
      </View>

      {!selectMode && (
        <View style={s.timeline}>
          {places
            .slice()
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((place, idx) => {
              const isPast = isPlacePast(itinerary.startDate, place.estimatedVisitTime);
              return (
                <View key={idx} style={s.timelineItem}>
                  <View style={s.timelineLeft}>
                    <View style={[s.timelineDot, isPast ? s.timelineDotPast : (idx === 0 ? s.timelineDotFirst : s.timelineDotNext)]} />
                    {idx < places.length - 1 && <View style={s.timelineLine} />}
                  </View>
                  <View style={[s.timelineContent, isPast && s.timelineContentPast]}>
                    <Text style={s.timelineTime}>{formatTime(place.estimatedVisitTime)}</Text>
                    <Text style={s.timelineName} numberOfLines={1}>{place.name}</Text>
                    <Text style={s.timelineAddress} numberOfLines={1}>{place.address}</Text>
                  </View>
                </View>
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
    </TouchableOpacity>
  );
}
