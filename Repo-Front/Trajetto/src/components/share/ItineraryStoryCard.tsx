import React, { forwardRef } from 'react';
import { Image, Text, View, type ViewInstance } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Places } from '@/hooks/itineraryStore';
import { cityImage } from '@/src/helpers/cityImage';
import { cityName, formatDateRange, formatDecimal, placeName } from '@/src/i18n/format';
import { TripStats } from '@/src/domain/trip/tripStats';
import { useColors } from '@/src/theme';
import { storyStyles, STORY_GRADIENT } from './storyStyles';

const MAX_DAYS = 3;
const MAX_STOPS_PER_DAY = 4;

type Props = {
  width: number;
  city?: string | null;
  title: string;
  startDate: string;
  endDate?: string | null;
  stats: TripStats<Places>;
  /** Texto de cima: "Meu roteiro em" ou "Minha viagem a". */
  headline: string;
};

/** Cartao no formato de story (9:16) com a cidade, os numeros da viagem e as paradas de cada dia. */
const ItineraryStoryCard = forwardRef<ViewInstance, Props>(function ItineraryStoryCard(
  { width, city, title, startDate, endDate, stats, headline }, ref,
) {
  const { t } = useTranslation('itinerario');
  const s = storyStyles(width / 360, useColors());
  const image = cityImage(city);
  const extraDays = stats.perDay.length - MAX_DAYS;

  return (
    <View ref={ref} collapsable={false} style={[s.card, { width, height: (width * 16) / 9 }]}>
      {image && <Image source={image} style={s.background} resizeMode="cover" />}
      <LinearGradient colors={STORY_GRADIENT} style={s.background} />

      <View style={s.topRow}>
        <Text style={s.brand}>Trajetto</Text>
        <View style={s.pill}>
          <Text style={s.pillText}>{t('share.daysPill', { count: stats.days })}</Text>
        </View>
      </View>

      <View style={s.body}>
        <Text style={s.headline}>{headline}</Text>
        <Text style={s.city} numberOfLines={2} adjustsFontSizeToFit>{cityName(city) || title}</Text>
        <Text style={s.subtitle} numberOfLines={1}>
          {endDate ? formatDateRange(startDate, endDate) : title}
        </Text>

        <View style={s.statsRow}>
          <View style={s.stat}>
            <Text style={s.statValue}>{stats.stops}</Text>
            <Text style={s.statLabel}>{t('share.stops')}</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statValue}>{formatDecimal(stats.km)}</Text>
            <Text style={s.statLabel}>{t('share.km')}</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statValue}>{stats.categories.length}</Text>
            <Text style={s.statLabel}>{t('share.styles')}</Text>
          </View>
        </View>

        {stats.perDay.slice(0, MAX_DAYS).map((day) => (
          <View key={day.date} style={s.day}>
            <Text style={s.dayLabel}>{t('share.day', { number: day.number })}</Text>
            <Text style={s.dayStops} numberOfLines={2}>
              {day.stops.slice(0, MAX_STOPS_PER_DAY).map((p) => placeName(p)).join('  •  ')}
              {day.stops.length > MAX_STOPS_PER_DAY ? `  +${day.stops.length - MAX_STOPS_PER_DAY}` : ''}
            </Text>
          </View>
        ))}
        {extraDays > 0 && <Text style={s.more}>{t('share.moreDays', { count: extraDays })}</Text>}
      </View>

      <Text style={s.footer}>{t('share.footer')}</Text>
    </View>
  );
});

export default ItineraryStoryCard;
