import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/src/theme';
import { formatDate } from '@/src/i18n/format';
import { styles } from './styles';

type ItineraryHeaderCardProps = {
  startDate: string;
  endDate: string;
  stopsCount: number;
};

export default function ItineraryHeaderCard({ startDate, endDate, stopsCount }: ItineraryHeaderCardProps) {
  const { t } = useTranslation('itinerario');
  const s = styles(useColors());
  const days = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  return (
    <View style={s.headerCard}>
      <Text style={s.headerLabel}>{t('headerCard.period')}</Text>
      <Text style={s.headerDates}>
        {formatDate(startDate)} → {formatDate(endDate)}
      </Text>
      <View style={s.statsRow}>
        <View style={s.stat}>
          <Text style={s.statValue}>{stopsCount}</Text>
          <Text style={s.statLabel}>{t('headerCard.stops')}</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.stat}>
          <Text style={s.statValue}>{days}</Text>
          <Text style={s.statLabel}>{t('headerCard.days')}</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.stat}>
          <View style={s.activeDot} />
          <Text style={s.statLabel}>{t('headerCard.active')}</Text>
        </View>
      </View>
    </View>
  );
}
