import React from 'react';
import { Text, View } from 'react-native';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type StatListRowProps = {
  label: string;
  value: string | number;
  subValue?: string;
  isLast?: boolean;
};

export default function StatListRow({ label, value, subValue, isLast }: StatListRowProps) {
  const s = styles(useColors());
  return (
    <View style={[s.row, !isLast && s.rowBorder]}>
      <Text style={s.label} numberOfLines={1}>{label}</Text>
      <View style={s.valueGroup}>
        <Text style={s.value}>{value}</Text>
        {subValue ? <Text style={s.subValue}>{subValue}</Text> : null}
      </View>
    </View>
  );
}
