import React from 'react';
import { ImageBackground, ImageSourcePropType, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/src/theme';
import { formatDate, formatTime } from '@/src/i18n/format';
import { styles } from './styles';

type ItineraryHeaderCardProps = {
  title: string;
  image: ImageSourcePropType | null;
  onRename: () => void;
  startDate: string;
  endDate: string;
  stopsCount: number;
  daysCount: number;
  startTime?: string;
  endTime?: string;
};

export default function ItineraryHeaderCard({ title, image, onRename, startDate, endDate, stopsCount, daysCount, startTime, endTime }: ItineraryHeaderCardProps) {
  const { t } = useTranslation('itinerario');
  const colors = useColors();
  const s = styles(colors);
  const sameDay = startDate === endDate;

  return (
    <ImageBackground source={image ?? undefined} style={s.headerCard} resizeMode="cover">
      {image && <View style={s.imageShade} />}
      <TouchableOpacity
        style={s.titleRow}
        onPress={onRename}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={t('headerCard.rename')}
      >
        <Text style={s.title} numberOfLines={2}>{title}</Text>
        <Ionicons name="pencil" size={16} color={colors.onPrimaryFaint60} />
      </TouchableOpacity>
      <View style={s.headerTopRow}>
        <Text style={s.headerLabel}>{t('headerCard.period')}</Text>
        <View style={s.activeBadge}>
          <View style={s.activeDot} />
          <Text style={s.activeBadgeText}>{t('headerCard.active')}</Text>
        </View>
      </View>
      <Text style={s.headerDates}>
        {sameDay ? formatDate(startDate) : `${formatDate(startDate)} → ${formatDate(endDate)}`}
      </Text>
      {startTime && endTime && (
        <View style={s.headerHoursRow}>
          <Ionicons name="time-outline" size={14} color={colors.onPrimaryFaint60} />
          <Text style={s.headerHours}>
            {formatTime(startTime)} - {formatTime(endTime)}
          </Text>
        </View>
      )}
      <View style={s.statsRow}>
        <View style={s.stat}>
          <Text style={s.statValue}>{stopsCount}</Text>
          <Text style={s.statLabel}>{t('headerCard.stops')}</Text>
        </View>
        {daysCount > 1 && (
          <View style={s.stat}>
            <Text style={s.statValue}>{daysCount}</Text>
            <Text style={s.statLabel}>{t('headerCard.days')}</Text>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}
