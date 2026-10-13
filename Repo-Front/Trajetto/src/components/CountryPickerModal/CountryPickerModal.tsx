import React from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { countries } from '@/utils/countries';
import { countryLabel } from '@/src/i18n/countries';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type CountryPickerModalProps = {
  visible: boolean;
  selected: string;
  onSelect: (country: string) => void;
  onClose: () => void;
};

export default function CountryPickerModal({ visible, selected, onSelect, onClose }: CountryPickerModalProps) {
  const { t, i18n } = useTranslation('common');
  const s = styles(useColors());
  const ordenados = [...countries].sort((a, b) =>
    countryLabel(a, i18n.language).localeCompare(countryLabel(b, i18n.language), i18n.language));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />
          <Text style={s.modalTitle}>{t('selectCountry')}</Text>
          <FlatList
            data={ordenados}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.modalItem} onPress={() => onSelect(item)}>
                <Text style={[s.modalItemText, selected === item && s.modalItemSelected]}>
                  {countryLabel(item, i18n.language)}
                </Text>
                {selected === item && <Text style={s.checkmark}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
