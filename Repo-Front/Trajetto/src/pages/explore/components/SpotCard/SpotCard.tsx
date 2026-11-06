import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Place } from '@/services';
import { usePlaceImage } from '@/hooks/usePlaceImage';
import { useColors } from '@/src/theme';
import { categoryIcon, categoryLabel } from '@/src/helpers/categoryIcon';
import { styles } from './styles';
import { placeName } from '@/src/i18n/format';

type SpotCardProps = {
  spot: Pick<Place, 'name' | 'category' | 'address' | 'names' | 'wikidata'>;
  onPress: () => void;
};

export default function SpotCard({ spot, onPress }: SpotCardProps) {
  const { t } = useTranslation('common');
  const colors = useColors();
  const s = styles(colors);
  const image = usePlaceImage(spot.wikidata);
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8}>
      {image ? (
        <Image
          source={{ uri: image }}
          style={s.cardImage}
          resizeMode="cover"
          accessible
          accessibilityRole="image"
          accessibilityLabel={t('photoOf', { name: placeName(spot) })}
        />
      ) : (
        <View style={s.cardIcon}>
          <Ionicons name={categoryIcon(spot.category)} size={24} color={colors.primaryText} />
        </View>
      )}
      <View style={s.cardContent}>
        <Text style={s.cardName} numberOfLines={1}>{placeName(spot)}</Text>
        <Text style={s.cardCategory} numberOfLines={1}>{categoryLabel(spot.category)}</Text>
        {spot.address ? <Text style={s.cardAddress} numberOfLines={1}>{spot.address}</Text> : null}
      </View>
      <Text style={s.cardArrow}>›</Text>
    </TouchableOpacity>
  );
}
