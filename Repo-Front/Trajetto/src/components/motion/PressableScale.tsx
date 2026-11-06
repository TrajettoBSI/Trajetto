import React from 'react';
import { GestureResponderEvent, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SPRING = { damping: 18, stiffness: 320, mass: 0.6 };

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean;
};

export default function PressableScale({
  style, scaleTo = 0.97, haptic = false, onPress, onPressIn, onPressOut, children, ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = (event: GestureResponderEvent) => {
    scale.set(withSpring(scaleTo, SPRING));
    onPressIn?.(event);
  };
  const handlePressOut = (event: GestureResponderEvent) => {
    scale.set(withSpring(1, SPRING));
    onPressOut?.(event);
  };
  const handlePress = (event: GestureResponderEvent) => {
    if (haptic && process.env.EXPO_OS !== 'web') Haptics.selectionAsync().catch(() => {});
    onPress?.(event);
  };

  return (
    <AnimatedPressable
      {...rest}
      style={[style, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {children}
    </AnimatedPressable>
  );
}
