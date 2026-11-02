import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/src/theme';
import { formatDecimal } from '@/src/i18n/format';
import { styles } from './styles';

const LONG_WALK_MINUTES = 30;

type TravelLegProps = {
  minutes: number;
  km: number;
  fromStart: boolean;
};

export default function TravelLeg({ minutes, km, fromStart }: TravelLegProps) {
  const { t } = useTranslation('itinerario');
  const colors = useColors();
  const s = styles(colors);
  const long = minutes > LONG_WALK_MINUTES;

  return (
    <View style={s.row}>
      <View style={s.rail}>
        <View style={s.dash} />
      </View>
      <View style={[s.pill, long && s.pillLong]}>
        <Ionicons name={long ? 'bus-outline' : 'walk-outline'} size={13} color={long ? colors.warningBannerText : colors.textMuted} />
        <Text style={[s.text, long && s.textLong]}>
          {t(fromStart ? 'leg.fromStart' : 'leg.walk', { minutes, km: formatDecimal(km) })}
          {long ? ` - ${t('leg.transitHint')}` : ''}
        </Text>
      </View>
    </View>
  );
}
