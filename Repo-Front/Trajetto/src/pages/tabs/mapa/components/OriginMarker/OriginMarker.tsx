import React from 'react';
import { Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/src/theme';
import { styles } from './styles';

export default function OriginMarker({ latitude, longitude }: { latitude: number; longitude: number }) {
  const { t } = useTranslation('mapa');
  const s = styles(useColors());
  return (
    <Marker coordinate={{ latitude, longitude }} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
      <View style={s.originWrapper}>
        <View style={s.originDot} />
        <View style={s.originLabel}><Text style={s.originLabelText}>{t('originLabel')}</Text></View>
      </View>
    </Marker>
  );
}
