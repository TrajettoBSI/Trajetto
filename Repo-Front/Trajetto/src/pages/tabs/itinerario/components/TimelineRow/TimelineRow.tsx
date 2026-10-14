import React from 'react';
import { LayoutChangeEvent, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Places } from '@/hooks/itineraryStore';
import { TicketCard } from '@/components/TicketCard';
import { useColors } from '@/src/theme';
import { styles } from './styles';

export type TimelineEditProps = {
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
};

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
  onNotePress: () => void;
  edit?: TimelineEditProps | null;
};

export default function TimelineRow({
  place, idx, color, isPast, isLast, isHighlighted, onLayout, onSwitchPress, onPress, onInfoPress, onNotePress, edit,
}: TimelineRowProps) {
  const { t } = useTranslation('itinerario');
  const colors = useColors();
  const s = styles(colors);

  return (
    <View style={s.timelineRow} onLayout={onLayout}>
      <View style={s.rail}>
        <View style={[s.dot, isPast ? s.dotPast : { backgroundColor: color }]} />
        {!isLast && <View style={s.line} />}
      </View>

      <View style={s.content}>
        <TicketCard
          place={place}
          idx={idx}
          color={color}
          isPast={isPast}
          isHighlighted={isHighlighted}
          isLast={isLast && !edit}
          onPress={onPress}
          onInfoPress={onInfoPress}
          onSwitchPress={onSwitchPress}
          onNotePress={onNotePress}
        />

        {edit && (
          <View style={s.editBar}>
            <TouchableOpacity
              style={s.editBtn}
              onPress={edit.onMoveUp}
              disabled={!edit.canMoveUp || edit.disabled}
              accessibilityRole="button"
              accessibilityLabel={t('edit.moveUp', { name: place.name })}
            >
              <Ionicons name="arrow-up" size={18} color={edit.canMoveUp ? colors.primary : colors.borderMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={s.editBtn}
              onPress={edit.onMoveDown}
              disabled={!edit.canMoveDown || edit.disabled}
              accessibilityRole="button"
              accessibilityLabel={t('edit.moveDown', { name: place.name })}
            >
              <Ionicons name="arrow-down" size={18} color={edit.canMoveDown ? colors.primary : colors.borderMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.editBtn, s.removeBtn]}
              onPress={edit.onRemove}
              disabled={edit.disabled}
              accessibilityRole="button"
              accessibilityLabel={t('edit.removeLabel', { name: place.name })}
            >
              <Ionicons name="trash-outline" size={16} color={colors.errorText} />
              <Text style={s.removeText}>{t('edit.remove')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
