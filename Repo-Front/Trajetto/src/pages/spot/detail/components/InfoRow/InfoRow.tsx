import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type InfoRowProps = {
  value: string;
  prefix?: string;
  onPress?: () => void;
  isLast?: boolean;
};

export default function InfoRow({ value, prefix, onPress, isLast }: InfoRowProps) {
  const s = styles(useColors());
  if (!value) return null;
  return (
    <TouchableOpacity
      style={[s.infoRow, isLast && s.infoRowLast]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={s.infoText}>
        {prefix ? <Text style={s.infoPrefix}>{prefix} </Text> : null}
        <Text style={onPress ? s.infoLink : undefined}>{value}</Text>
      </Text>
    </TouchableOpacity>
  );
}
