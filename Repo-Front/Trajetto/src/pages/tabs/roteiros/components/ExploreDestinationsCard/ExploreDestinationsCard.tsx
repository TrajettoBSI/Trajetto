import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import PressableScale from '@/src/components/motion/PressableScale';
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
    <PressableScale style={s.card} onPress={onPress} haptic accessibilityRole="button">
      <LinearGradient colors={colors.gradientAction} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.iconBadge}>
        <Ionicons name="compass" size={24} color={colors.onPrimary} />
      </LinearGradient>
      <View style={s.textWrapper}>
        <Text style={s.title}>{t('exploreCard.title')}</Text>
        <Text style={s.subtitle}>{t('exploreCard.subtitle')}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSubtle} />
    </PressableScale>
  );
}
