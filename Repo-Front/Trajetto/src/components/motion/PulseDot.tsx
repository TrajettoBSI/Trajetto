import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';

type PulseDotProps = {
  color: string;
  size?: number;
};

export default function PulseDot({ color, size = 7 }: PulseDotProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 2600 }), -1, false);
  }, [progress]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.3, 0]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 2.1]) }],
  }));

  const dot = { width: size, height: size, borderRadius: size / 2, backgroundColor: color };

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[{ position: 'absolute' }, dot, haloStyle]} />
      <View style={dot} />
    </View>
  );
}
