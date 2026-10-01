import React from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { Places } from '@/hooks/itineraryStore';
import { TicketCard } from '@/components/TicketCard';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type TimelineRowProps = {
  place: Places;
  idx: number;
  color: string;
  isPast: boolean;
  isLast: boolean;
  isHighlighted: boolean;
  onLayout: (e: LayoutChangeEvent) => void;
  onSwitchPress: () => void;
  onPress: () => void;
  onInfoPress: () => void;
};

export default function TimelineRow({
  place, idx, color, isPast, isLast, isHighlighted, onLayout, onSwitchPress, onPress, onInfoPress,
}: TimelineRowProps) {
  const s = styles(useColors());

  return (
    <View style={s.timelineRow} onLayout={onLayout}>
      <View style={s.rail}>
        <View style={[s.dot, isPast ? s.dotPast : { backgroundColor: color }]} />
        {!isLast && <View style={s.line} />}
      </View>

      <TicketCard
        place={place}
        idx={idx}
        color={color}
        isPast={isPast}
        isHighlighted={isHighlighted}
        isLast={isLast}
        onPress={onPress}
        onInfoPress={onInfoPress}
        onSwitchPress={onSwitchPress}
      />
    </View>
  );
}
