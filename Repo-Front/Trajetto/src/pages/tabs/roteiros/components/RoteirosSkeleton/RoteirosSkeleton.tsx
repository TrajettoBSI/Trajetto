import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Skeleton from '@/src/components/motion/Skeleton';
import { useColors } from '@/src/theme';
import { styles } from './styles';

export default function RoteirosSkeleton() {
  const { t } = useTranslation('roteiros');
  const s = styles(useColors());

  return (
    <View accessibilityRole="progressbar" accessibilityLabel={t('loadingItineraries')}>
      <Skeleton style={s.label} />
      <View style={s.card}>
        <Skeleton style={s.cover} />
        <Skeleton style={s.title} />
        <Skeleton style={s.subtitle} />
        <Skeleton style={s.progress} />
        {[0, 1, 2].map((row) => (
          <View key={row} style={s.row}>
            <Skeleton style={s.dot} />
            <View style={s.rowText}>
              <Skeleton style={s.rowTitle} />
              <Skeleton style={s.rowSubtitle} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
