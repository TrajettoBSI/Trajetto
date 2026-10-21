import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { NearbyPlace } from '@/services';
import { useColors } from '@/src/theme';
import { formatDistance as formatarDistancia, formatTime, placeName } from '@/src/i18n/format';
import { MealSuggestion } from '../../hooks/useMealSuggestions';
import { styles } from './styles';

const MEAL_ICON = { breakfast: '☕', lunch: '🍝', dinner: '🍷' } as const;

const formatDistance = (meters?: number | null) =>
  meters == null ? '' : formatarDistancia(meters < 1000 ? Math.round(meters / 10) * 10 : meters);

type MealSuggestionCardProps = {
  suggestion: MealSuggestion;
  onSelect: (place: NearbyPlace) => void;
  onRetry: () => void;
};

export default function MealSuggestionCard({ suggestion, onSelect, onRetry }: MealSuggestionCardProps) {
  const { t } = useTranslation('itinerario');
  const colors = useColors();
  const s = styles(colors);
  const { meal, anchor, options, failed } = suggestion;

  if (options && options.length === 0) return null;

  return (
    <View style={s.row}>
      <View style={s.rail}>
        <View style={s.railLine} />
      </View>
      <View style={s.card}>
        <View style={s.header}>
          <Text style={s.icon}>{MEAL_ICON[meal.id]}</Text>
          <View style={s.headerText}>
            <Text style={s.title}>
              {t(`meals.${meal.id}`)} · {formatTime(meal.time)}
            </Text>
            <Text style={s.subtitle} numberOfLines={1}>{t('meals.near', { name: anchor.name })}</Text>
          </View>
        </View>

        {failed ? (
          <TouchableOpacity style={s.retry} onPress={onRetry} activeOpacity={0.7}>
            <Text style={s.retryText}>{t('meals.loadError')}</Text>
            <Text style={s.retryAction}>{t('meals.retry')}</Text>
          </TouchableOpacity>
        ) : options === null ? (
          <ActivityIndicator size="small" color={colors.primary} style={s.loading} />
        ) : (
          options.map((place) => (
            <TouchableOpacity
              key={`${place.name}-${place.latitude}`}
              style={s.option}
              onPress={() => onSelect(place)}
              activeOpacity={0.7}
            >
              <Text style={s.optionName} numberOfLines={1}>{placeName(place)}</Text>
              <Text style={s.optionDistance}>{formatDistance(place.distanceMeters)}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.gray400} />
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
}
