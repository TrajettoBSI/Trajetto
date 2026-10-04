import React from 'react';
import { Text, View } from 'react-native';
import { chartColors, useColors } from '@/src/theme';
import { styles } from './styles';

type DonutLegendProps<T extends Record<string, any>> = {
  data: T[];
  labelKey: keyof T;
  valueKey: keyof T;
  labelWidth?: number;
  uppercase?: boolean;
  bold?: boolean;
  bullet?: boolean;
};

export default function DonutLegend<T extends Record<string, any>>({
  data, labelKey, valueKey, labelWidth = 110, uppercase = true, bold = true, bullet = true,
}: DonutLegendProps<T>) {
  const s = styles(useColors());
  const total = data.reduce((acc, d) => acc + d[valueKey], 0);

  return (
    <View style={s.donutLegend}>
      {data.map((item, i) => {
        const pct = total > 0 ? Math.round((item[valueKey] / total) * 100) : 0;
        const label = String(item[labelKey]);
        return (
          <View key={i} style={s.donutRow}>
            {bullet && <Text style={s.donutBullet}>{'•'}</Text>}
            <Text
              style={[s.donutLabel, bold && s.donutLabelBold, { width: labelWidth }]}
              numberOfLines={1}
            >
              {uppercase ? label.toUpperCase() : label}
            </Text>
            <View style={s.donutBarTrack}>
              <View style={[s.donutBarFill, { width: `${pct}%`, backgroundColor: chartColors[i % chartColors.length] }]} />
            </View>
            <Text style={s.donutPct}>{pct}%</Text>
          </View>
        );
      })}
    </View>
  );
}
