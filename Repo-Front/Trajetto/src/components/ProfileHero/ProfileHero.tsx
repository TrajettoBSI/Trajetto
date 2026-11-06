import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/theme';
import { styles, SVG_HEIGHT } from './styles';

const { width } = Dimensions.get('window');

const WAVE_BASELINE = SVG_HEIGHT * 0.72;
const WAVE_AMPLITUDE = 6;
const WAVE_HUMPS = 6;

function buildRipplePath(w: number, baseline: number, amplitude: number, humps: number): string {
  const segments = humps * 2;
  const segmentWidth = w / segments;
  let path = `M0,0 L0,${baseline}`;
  for (let i = 0; i < segments; i++) {
    const midX = (i + 0.5) * segmentWidth;
    const endX = (i + 1) * segmentWidth;
    const sign = i % 2 === 0 ? -1 : 1;
    const controlY = baseline + sign * amplitude * 2;
    path += ` Q ${midX},${controlY} ${endX},${baseline}`;
  }
  path += ` L ${w},0 Z`;
  return path;
}

type ProfileHeroProps = {
  name: string;
  email?: string;
  travelerProfile?: string;
};

export default function ProfileHero({ name, email, travelerProfile }: ProfileHeroProps) {
  const colors = useColors();
  const s = styles(colors);

  const wavePath = buildRipplePath(width, WAVE_BASELINE, WAVE_AMPLITUDE, WAVE_HUMPS);

  return (
    <View style={s.wrapper}>
      <Svg width={width} height={SVG_HEIGHT} style={s.svg}>
        <Defs>
          <LinearGradient id="profileHero" x1="0" y1="0" x2="1" y2="0">
            {colors.gradientHero.map((stop, i) => (
              <Stop key={stop + i} offset={i / (colors.gradientHero.length - 1)} stopColor={stop} />
            ))}
          </LinearGradient>
        </Defs>
        <Path d={wavePath} fill="url(#profileHero)" />
      </Svg>

      <Ionicons name="briefcase-outline" size={20} color={colors.onPrimaryFaint20} style={[s.patternIcon, { top: 14, left: 110, transform: [{ rotate: '-12deg' }] }]} />
      <Ionicons name="airplane-outline" size={22} color={colors.onPrimaryFaint20} style={[s.patternIcon, { top: 32, right: 28, transform: [{ rotate: '35deg' }] }]} />
      <Ionicons name="glasses-outline" size={18} color={colors.onPrimaryFaint20} style={[s.patternIcon, { top: 85, left: 30, transform: [{ rotate: '-6deg' }] }]} />

      <View style={s.avatarCircle}>
        {name.trim()
          ? <Text style={s.avatarInitial}>{name.trim().charAt(0).toUpperCase()}</Text>
          : <Ionicons name="person" size={44} color={colors.primaryText} />}
      </View>

      <View style={s.info}>
        <Text style={s.userName}>{name}</Text>
        {email ? <Text style={s.userEmail}>{email}</Text> : null}
        {travelerProfile ? (
          <View style={s.profileBadge}>
            <Ionicons name="briefcase" size={14} color={colors.primaryText} />
            <Text style={s.profileBadgeText}>{travelerProfile}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
