import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useItineraryStore } from '@/hooks/itineraryStore';
import { useColors } from '@/src/theme';
import { styles } from './styles';

/** Aviso de que o roteiro na tela e a copia salva no aparelho, sem internet. */
export default function OfflineBanner() {
  const { t } = useTranslation('common');
  const offline = useItineraryStore((state) => state.offline);
  const colors = useColors();
  const s = styles(colors);
  if (!offline) return null;

  return (
    <View style={s.banner} accessibilityRole="alert">
      <Ionicons name="cloud-offline-outline" size={18} color={colors.warningBannerText} />
      <Text style={s.text}>{t('offlineBanner')}</Text>
    </View>
  );
}
