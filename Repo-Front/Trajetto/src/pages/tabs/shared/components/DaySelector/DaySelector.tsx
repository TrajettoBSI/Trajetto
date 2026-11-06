import React from 'react';
import { ScrollView, StyleProp, Text, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import PressableScale from '@/src/components/motion/PressableScale';
import { useColors } from '@/src/theme';
import { formatWeekdayDayMonth } from '@/src/i18n/format';
import { styles } from './styles';

type DaySelectorProps = {
  days: { date: string; number: number }[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
  style?: StyleProp<ViewStyle>;
};

export default function DaySelector({ days, selectedDate, onSelect, style }: DaySelectorProps) {
  const { t } = useTranslation('itinerario');
  const s = styles(useColors());

  if (days.length < 2) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={style} contentContainerStyle={s.row}>
      {days.map((day) => {
        const active = day.date === selectedDate;
        return (
          <PressableScale
            key={day.date}
            style={[s.chip, active && s.chipActive]}
            onPress={() => onSelect(day.date)}
            scaleTo={0.94}
            haptic
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[s.chipTitle, active && s.chipTitleActive]}>{t('daySelector.day', { number: day.number })}</Text>
            <Text style={[s.chipDate, active && s.chipDateActive]}>{formatWeekdayDayMonth(day.date)}</Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}
