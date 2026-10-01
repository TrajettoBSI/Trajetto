import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/theme';
import { MenuItem as MenuItemType } from '@/src/pages/profile/Perfil/hooks/usePerfil';
import { styles } from './styles';

export default function MenuItem({ icon, label, value, onPress, danger }: MenuItemType) {
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
