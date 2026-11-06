import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing, FadeIn, SharedValue, useAnimatedProps, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppColors, useColors } from '@/src/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ROUTE = 'M24 118 C 50 62, 78 58, 100 88 S 146 128, 172 88 S 210 30, 236 44';
const ROUTE_LENGTH = 287;
const STOPS = [
  { x: 24, y: 118, at: 0 },
  { x: 100, y: 88, at: 0.371 },
  { x: 172, y: 88, at: 0.694 },
  { x: 236, y: 44, at: 1 },
];
const DRAW_END = 0.75;
const FADE_START = 0.9;
const CYCLE_MS = 2800;
const STEP_MS = 1800;
const STOP_RADIUS = 8;

function fadeOut(value: number) {
  'worklet';
  return value < FADE_START ? 1 : (1 - value) / (1 - FADE_START);
}

function Stop({ x, y, at, color, stroke, progress }: {
  x: number; y: number; at: number; color: string; stroke: string; progress: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => {
    const reached = (progress.value - at * DRAW_END) / 0.05;
    return {
      r: STOP_RADIUS * Math.max(0, Math.min(1, reached)),
      opacity: fadeOut(progress.value),
    };
  });

  return <AnimatedCircle cx={x} cy={y} fill={color} stroke={stroke} strokeWidth={3} animatedProps={animatedProps} />;
}

export default function RouteLoader({ title, steps }: { title: string; steps: string[] }) {
  const colors = useColors();
  const s = styles(colors);
  const progress = useSharedValue(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: CYCLE_MS, easing: Easing.linear }), -1, false);
  }, [progress]);

  useEffect(() => {
    const timer = setInterval(() => setStep((current) => (current + 1) % steps.length), STEP_MS);
    return () => clearInterval(timer);
  }, [steps.length]);

  const routeProps = useAnimatedProps(() => ({
    strokeDashoffset: ROUTE_LENGTH * (1 - Math.min(1, progress.value / DRAW_END)),
    opacity: fadeOut(progress.value),
  }));

  return (
    <View style={s.container}>
      <View style={s.route}>
        <Svg width="100%" height="100%" viewBox="0 0 260 150" style={StyleSheet.absoluteFill}>
          <Path d={ROUTE} stroke={colors.primaryText} strokeOpacity={0.2} strokeWidth={4} strokeLinecap="round" fill="none" />
          <AnimatedPath
            d={ROUTE}
            stroke={colors.primaryText}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={ROUTE_LENGTH}
            fill="none"
            animatedProps={routeProps}
          />
          {STOPS.map((stop, index) => (
            <Stop key={stop.at} {...stop} color={colors.placeColors[index]} stroke={colors.background} progress={progress} />
          ))}
        </Svg>
      </View>
      <Text style={s.title}>{title}</Text>
      <Animated.Text key={step} entering={FadeIn.duration(300)} style={s.step}>{steps[step]}</Animated.Text>
    </View>
  );
}

const styles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  route: { width: '100%', maxWidth: 340, aspectRatio: 260 / 150 },
  title: { fontSize: 26, letterSpacing: -0.5, fontFamily: 'Display-Bold', color: colors.gray900, textAlign: 'center', marginTop: 20 },
  step: { fontSize: 15, lineHeight: 22, color: colors.textMuted, textAlign: 'center', marginTop: 8, minHeight: 44 },
});
