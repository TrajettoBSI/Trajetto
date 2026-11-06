import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { placeColor, useColors } from '@/src/theme';
import { styles } from './styles';

type RouteBarProps = {
  firstUpcomingIdx: number;
  hasOriginSeg: boolean;
  placeName: string | undefined;
};

export default function RouteBar({ firstUpcomingIdx, hasOriginSeg, placeName }: RouteBarProps) {
  const { t } = useTranslation('mapa');
  const colors = useColors();
  const s = styles(colors);
  const currentColor = placeColor(colors, firstUpcomingIdx);
  const prevColor = placeColor(colors, Math.max(firstUpcomingIdx - 1, 0));
  const displayName = placeName && placeName.length > 16 ? placeName.slice(0, 16) + '…' : placeName;

  return (
    <View style={s.routeBar}>
      <View style={[s.routeDot, { backgroundColor: currentColor }]} />
      <Text style={s.routeText} numberOfLines={1}>
        <Text style={[s.routeLabel, { color: currentColor }]}>{t('routeBar.now')}</Text>
        {hasOriginSeg && firstUpcomingIdx === 0
          ? <Text style={[s.routeNum, { color: colors.primaryText }]}>{t('routeBar.start')}</Text>
          : <Text style={[s.routeNum, { color: prevColor }]}>{firstUpcomingIdx}</Text>
        }
        <Text style={s.routeArrow}> → </Text>
        <Text style={[s.routeNum, { color: currentColor }]}>{firstUpcomingIdx + 1}</Text>
        {'  '}{displayName}
      </Text>
    </View>
  );
}
