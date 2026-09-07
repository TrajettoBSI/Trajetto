import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Place } from '@/services';
import { categoryIcon } from '@/src/helpers/categoryIcon';
import { useColors } from '@/src/theme';
import { formatCarTime, formatDistance, formatWalkTime } from '../../mapaFormat';
import { styles } from './styles';

type SpotDetailCardProps = {
  spot: Place;
  distanceMeters: number | null;
  onClose: () => void;
};

export default function SpotDetailCard({ spot, distanceMeters, onClose }: SpotDetailCardProps) {
  const { t } = useTranslation('mapa');
  const router = useRouter();
  const s = styles(useColors());

  return (
    <View style={s.spotCard}>
      <View style={s.spotCardHeader}>
        <Text style={s.spotCardEmoji}>{categoryIcon(spot.category)}</Text>
        <View style={s.spotCardInfo}>
          <Text style={s.spotCardName} numberOfLines={1}>{spot.name}</Text>
          <Text style={s.spotCardCategory}>{spot.category}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={s.spotCardClose}>
          <Text style={s.spotCardCloseText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={s.spotCardMeta}>
        {spot.fee === 'no' && <View style={s.badge}><Text style={s.badgeText}>{t('spotDetailCard.free')}</Text></View>}
        {spot.fee === 'yes' && <View style={[s.badge, s.badgePaid]}><Text style={s.badgeText}>{t('spotDetailCard.paid')}</Text></View>}
        {spot.openingHours ? <View style={s.badge}><Text style={s.badgeText}>🕐 {spot.openingHours}</Text></View> : null}
      </View>

      {spot.address ? <Text style={s.spotCardDetail}>📍 {spot.address}</Text> : null}

      {distanceMeters !== null && (
        <View style={s.distanceRow}>
          <View style={s.distanceCard}>
            <Text style={s.distanceIcon}>🚶</Text>
            <Text style={s.distanceValue}>{formatWalkTime(distanceMeters)}</Text>
            <Text style={s.distanceLabel}>{t('spotDetailCard.walking')}</Text>
          </View>
          <View style={s.distanceDivider} />
          <View style={s.distanceCard}>
            <Text style={s.distanceIcon}>🚗</Text>
            <Text style={s.distanceValue}>{formatCarTime(distanceMeters)}</Text>
            <Text style={s.distanceLabel}>{t('spotDetailCard.driving')}</Text>
          </View>
          <View style={s.distanceDivider} />
          <View style={s.distanceCard}>
            <Text style={s.distanceIcon}>📏</Text>
            <Text style={s.distanceValue}>{formatDistance(distanceMeters)}</Text>
            <Text style={s.distanceLabel}>{t('spotDetailCard.fromHere')}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={s.spotCardBtn}
        onPress={() => router.push({ pathname: '/SpotDetailScreen', params: { spot: JSON.stringify(spot) } })}
        activeOpacity={0.85}
      >
        <Text style={s.spotCardBtnText}>{t('spotDetailCard.viewFullDetails')}</Text>
      </TouchableOpacity>
    </View>
  );
}
