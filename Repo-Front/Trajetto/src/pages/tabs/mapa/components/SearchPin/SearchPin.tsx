import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Place } from '@/services';
import { categoryIcon } from '@/src/helpers/categoryIcon';
import { useColors } from '@/src/theme';
import { styles } from './styles';

export default function SearchPin({ spot }: { spot: Place }) {
  const colors = useColors();
  const s = styles(colors);
  return (
    <Marker coordinate={{ latitude: spot.latitude, longitude: spot.longitude }} tracksViewChanges={false}>
      <View style={s.searchPinWrapper}>
        <View style={s.searchPin}>
          <Ionicons name={categoryIcon(spot.category)} size={18} color={colors.primaryText} />
        </View>
        <View style={s.searchPinTail} />
      </View>
    </Marker>
  );
}
