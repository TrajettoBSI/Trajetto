import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PlacesFilter } from '@/services';
import { useColors } from '@/src/theme';
import { formatDistance } from '../../mapaFormat';
import { styles } from './styles';

type ActiveFilterChipsProps = {
  activeFilter: PlacesFilter;
  onRemove: (patch: Partial<PlacesFilter>) => void;
};

export default function ActiveFilterChips({ activeFilter, onRemove }: ActiveFilterChipsProps) {
  const { t } = useTranslation('mapa');
  const s = styles(useColors());

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipsRow} keyboardShouldPersistTaps="handled">
      {activeFilter.category && (
        <View style={s.chip}>
          <Text style={s.chipText}>📍 {activeFilter.category}</Text>
          <TouchableOpacity onPress={() => onRemove({ category: undefined })}>
            <Text style={s.chipClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      {activeFilter.fee && (
        <View style={s.chip}>
          <Text style={s.chipText}>{activeFilter.fee === 'no' ? t('activeFilterChips.free') : t('activeFilterChips.paid')}</Text>
          <TouchableOpacity onPress={() => onRemove({ fee: undefined })}>
            <Text style={s.chipClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      {activeFilter.hasHours && (
        <View style={s.chip}>
          <Text style={s.chipText}>{t('activeFilterChips.hasHours')}</Text>
          <TouchableOpacity onPress={() => onRemove({ hasHours: undefined })}>
            <Text style={s.chipClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      {activeFilter.profile && (
        <View style={s.chip}>
          <Text style={s.chipText}>👤 {activeFilter.profile}</Text>
          <TouchableOpacity onPress={() => onRemove({ profile: undefined })}>
            <Text style={s.chipClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      {activeFilter.maxDistance && (
        <View style={s.chip}>
          <Text style={s.chipText}>📏 {formatDistance(activeFilter.maxDistance)}</Text>
          <TouchableOpacity onPress={() => onRemove({ maxDistance: undefined })}>
            <Text style={s.chipClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
