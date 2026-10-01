import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type ExploreDestinationsCardProps = {
  onPress: () => void;
};

export default function ExploreDestinationsCard({ onPress }: ExploreDestinationsCardProps) {
  const { t } = useTranslation('roteiros');
  const colors = useColors();
  const s = styles(colors);

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8}>
      <View style={s.iconBadge}>
        <Ionicons name="compass-outline" size={20} color={colors.primary} />
      </View>
      <View style={s.textWrapper}>
        <Text style={s.title}>{t('exploreCard.title')}</Text>
        <Text style={s.subtitle}>{t('exploreCard.subtitle')}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSubtle} />
    </TouchableOpacity>
  );
}
