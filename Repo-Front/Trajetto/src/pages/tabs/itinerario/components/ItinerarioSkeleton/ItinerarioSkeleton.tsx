import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Skeleton from '@/src/components/motion/Skeleton';
import { useColors } from '@/src/theme';
import { styles } from './styles';

export default function ItinerarioSkeleton() {
  const { t } = useTranslation('itinerario');
  const s = styles(useColors());

  return (
    <View style={s.container} accessibilityRole="progressbar" accessibilityLabel={t('loadingText')}>
      <Skeleton style={s.header} />
      <Skeleton style={s.insights} />
      {[0, 1].map((row) => (
        <View key={row} style={s.ticket}>
          <Skeleton style={s.ticketHeader} />
          <View style={s.ticketBody}>
            <Skeleton style={s.ticketTitle} />
            <Skeleton style={s.ticketSubtitle} />
            <Skeleton style={s.ticketTag} />
          </View>
        </View>
      ))}
    </View>
  );
}
