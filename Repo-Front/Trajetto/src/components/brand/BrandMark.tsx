import React, { useEffect } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, {
  Easing, useAnimatedProps, useSharedValue, withDelay, withTiming,
} from 'react-native-reanimated';
import { useColors } from '@/src/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const BAR = 'M10 17 H43';
const STEM = 'M25 17 V36 C25 47 32 50 43 50';
const BAR_LENGTH = 33;
const STEM_LENGTH = 54;

type BrandMarkProps = {
  size?: number;
  color?: string;
  draw?: boolean;
};

export default function BrandMark({ size = 48, color, draw = false }: BrandMarkProps) {
  const { primaryText } = useColors();
  const progress = useSharedValue(draw ? 0 : 1);

  useEffect(() => {
    if (draw) progress.value = withDelay(200, withTiming(1, { duration: 1100, easing: Easing.bezier(0.65, 0, 0.35, 1) }));
  }, [draw, progress]);

  const barProps = useAnimatedProps(() => ({ strokeDashoffset: BAR_LENGTH * (1 - Math.min(progress.value * 2, 1)) }));
  const stemProps = useAnimatedProps(() => ({ strokeDashoffset: STEM_LENGTH * (1 - Math.max(progress.value * 2 - 1, 0)) }));
  const nodeTop = useAnimatedProps(() => ({ opacity: progress.value > 0.5 ? 1 : 0 }));
  const nodeBottom = useAnimatedProps(() => ({ opacity: progress.value > 0.98 ? 1 : 0 }));

  const stroke = color ?? primaryText;
  const line = { stroke, strokeWidth: 6.5, strokeLinecap: 'round' as const, fill: 'none' };

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <AnimatedPath d={BAR} {...line} strokeDasharray={BAR_LENGTH} animatedProps={barProps} />
      <AnimatedPath d={STEM} {...line} strokeDasharray={STEM_LENGTH} animatedProps={stemProps} />
      <AnimatedCircle cx={50} cy={17} r={4.5} stroke={stroke} strokeWidth={4} fill="none" animatedProps={nodeTop} />
      <AnimatedCircle cx={50} cy={50} r={4.5} stroke={stroke} strokeWidth={4} fill="none" animatedProps={nodeBottom} />
    </Svg>
  );
}
