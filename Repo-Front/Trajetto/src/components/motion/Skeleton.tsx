import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useColors } from '@/src/theme';

type SkeletonProps = {
  style?: StyleProp<ViewStyle>;
};

export default function Skeleton({ style }: SkeletonProps) {
  const colors = useColors();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.45, { duration: 750 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[{ backgroundColor: colors.divider, borderRadius: 8 }, style, animatedStyle]} />;
}
