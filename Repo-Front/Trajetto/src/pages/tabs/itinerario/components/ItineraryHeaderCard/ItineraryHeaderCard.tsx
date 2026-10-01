import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/src/theme';
import { formatDate, formatTime } from '@/src/i18n/format';
import { styles } from './styles';

type ItineraryHeaderCardProps = {
  startDate: string;
  endDate: string;
  stopsCount: number;
  startTime?: string;
  endTime?: string;
};

export default function ItineraryHeaderCard({ startDate, endDate, stopsCount, startTime, endTime }: ItineraryHeaderCardProps) {
  const { t } = useTranslation('itinerario');
  const colors = useColors();
  const s = styles(colors);
  const sameDay = startDate === endDate;

  return (
    <View style={s.headerCard}>
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
      <View style={s.stat}>
        <Text style={s.statValue}>{stopsCount}</Text>
        <Text style={s.statLabel}>{t('headerCard.stops')}</Text>
      </View>
    </View>
  );
}
