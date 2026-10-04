import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/theme';
import { styles } from './styles';

export type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
};

export default function MenuItem({ icon, label, value, onPress, danger }: MenuItemProps) {
  const colors = useColors();
  const s = styles(colors);

  return (
    <TouchableOpacity style={s.item} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.iconBadge, danger && s.iconBadgeDanger]}>
        <Ionicons name={icon} size={18} color={danger ? colors.error : colors.primary} />
      </View>
      <Text style={[s.label, danger && s.labelDanger]}>{label}</Text>
      {value && <Text style={s.value}>{value}</Text>}
      {!danger && <Ionicons name="chevron-forward" size={20} color={colors.borderMuted} />}
    </TouchableOpacity>
  );
}
