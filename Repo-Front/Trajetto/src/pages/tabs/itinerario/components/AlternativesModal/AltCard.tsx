import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Place } from '@/services';
import { useColors } from '@/src/theme';
import { categoryIcon } from '@/src/helpers/categoryIcon';
import { formatDistance } from './distance';
import { styles } from './styles';

type AltCardProps = {
  alt: Place;
  onPress: () => void;
  distanceMeters: number | null;
};

export default function AltCard({ alt, onPress, distanceMeters }: AltCardProps) {
  const colors = useColors();
  const s = styles(colors);
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8}>
      <View style={s.iconBox}>
        <Text style={s.iconText}>{categoryIcon(alt.category)}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.name} numberOfLines={1}>{alt.name}</Text>
        <View style={s.metaRow}>
          {alt.category ? (
            <View style={s.catBadge}>
              <Text style={s.cat} numberOfLines={1}>{alt.category}</Text>
            </View>
          ) : null}
          {distanceMeters !== null ? (
            <Text style={s.distance}>{formatDistance(distanceMeters)}</Text>
          ) : null}
        </View>
        {alt.address ? (
          <Text style={s.addr} numberOfLines={1}>{alt.address}</Text>
        ) : null}
      </View>
      {alt.fee === 'no' && (
        <View style={s.freeBadge}><Text style={s.freeBadgeText}>🆓</Text></View>
      )}
      {alt.fee === 'yes' && (
        <View style={s.paidBadge}><Text style={s.paidBadgeText}>💰</Text></View>
      )}
      <Text style={s.chevron}>›</Text>
    </TouchableOpacity>
  );
}
