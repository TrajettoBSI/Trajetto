import React, { useEffect } from 'react';
import { Image, ImageSourcePropType, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type DestinationCardProps = {
  titleKey: string;
  subtitleKey: string;
  hours: number;
  image: ImageSourcePropType;
  bgColor: string;
  rotation: string;
  style?: object;
  animKey: number;
};

export default function DestinationCard({
  titleKey, subtitleKey, hours, image, bgColor, rotation, style, animKey,
}: DestinationCardProps) {
  const { t } = useTranslation('roteiros');
  const s = styles(useColors());
  const swing = useSharedValue(0);

  useEffect(() => {
    swing.value = withSequence(
      withTiming(-8, { duration: 80, easing: Easing.out(Easing.quad) }),
      withTiming(6, { duration: 80, easing: Easing.out(Easing.quad) }),
      withTiming(-4, { duration: 70, easing: Easing.out(Easing.quad) }),
      withTiming(2, { duration: 70, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 60, easing: Easing.out(Easing.quad) }),
    );
  }, [animKey]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: rotation },
      { rotate: `${swing.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[s.card, { backgroundColor: bgColor, transform: [{ rotate: rotation }] }, style, animStyle]}>
      <View style={s.cardTop}>
        <Text style={s.cardTitle} adjustsFontSizeToFit numberOfLines={1}>{t(titleKey)}</Text>
        <View style={s.timeBadge}>
          <Text style={s.timeText} adjustsFontSizeToFit numberOfLines={1}>{t('destinations.flightTime', { hours })}</Text>
        </View>
      </View>
      <Text style={s.cardSubtitle}>{t(subtitleKey)}</Text>
      <Image source={image} style={s.cardImage} />
    </Animated.View>
  );
}
