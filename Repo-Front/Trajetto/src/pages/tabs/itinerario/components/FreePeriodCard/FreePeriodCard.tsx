import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/src/theme';
import { FreePeriod } from '@/src/domain/itinerary/freePeriod';
import { styles } from './styles';

export default function FreePeriodCard({ period }: { period: FreePeriod['period'] }) {
  const { t } = useTranslation('itinerario');
  const s = styles(useColors());

  return (
    <View style={s.row}>
      <View style={s.rail}>
        <View style={s.railLine} />
      </View>
      <View style={s.card}>
        <View style={s.textBox}>
          <Text style={s.title}>{t(`freePeriod.${period}.title`)}</Text>
          <Text style={s.text}>{t(`freePeriod.${period}.text`)}</Text>
        </View>
      </View>
    </View>
  );
}
