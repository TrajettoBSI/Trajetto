import React from 'react';
import { Text, View } from 'react-native';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type HeroStatCardProps = {
  label: string;
  value: number | string;
  chips: string[];
};

export default function HeroStatCard({ label, value, chips }: HeroStatCardProps) {
  const s = styles(useColors());
  return (
    <View style={s.card}>
      <Text style={s.label}>{label}</Text>
      <View style={s.row}>
        <Text style={s.number}>{value}</Text>
        <View style={s.chipRow}>
          {chips.map((chip, i) => (
            <View key={i} style={s.chip}>
              <Text style={s.chipText}>{chip}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
