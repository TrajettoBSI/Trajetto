import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useColors } from '@/src/theme';

const contour = (cx: number, cy: number, radius: number, phase: number) => {
  const points = Array.from({ length: 72 }, (_, i) => {
    const angle = (i / 72) * Math.PI * 2;
    const r = radius * (1 + 0.14 * Math.sin(3 * angle + phase) + 0.07 * Math.sin(5 * angle + phase * 1.7));
    return `${(cx + r * Math.cos(angle)).toFixed(1)} ${(cy + r * 0.82 * Math.sin(angle)).toFixed(1)}`;
  });
  return `M${points.join('L')}Z`;
};

const CONTOURS = [
  ...[34, 62, 90, 118, 146, 174, 202].map((r) => contour(330, 52, r, 0.6)),
  ...[26, 50, 74, 98, 122].map((r) => contour(44, 214, r, 2.2)),
];

export default function HeroFill({ variant = 'tall' }: { variant?: 'tall' | 'bar' }) {
  const { gradientHero, heroLine } = useColors();
  const bar = variant === 'bar';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={gradientHero}
        start={bar ? { x: 0, y: 0.5 } : { x: 0.1, y: 0 }}
        end={bar ? { x: 1, y: 0.5 } : { x: 0.75, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg width="100%" height="100%" viewBox="0 0 390 260" preserveAspectRatio="xMidYMid slice">
        {CONTOURS.map((d) => <Path key={d} d={d} stroke={heroLine} strokeWidth={1} fill="none" />)}
      </Svg>
    </View>
  );
}
