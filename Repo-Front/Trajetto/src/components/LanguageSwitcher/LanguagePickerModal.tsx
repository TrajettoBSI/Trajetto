import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/src/theme';
import { LanguageCode, SUPPORTED_LANGUAGES } from '@/src/i18n/languages';
import { styles } from './styles';

type LanguagePickerModalProps = {
  visible: boolean;
  onClose: () => void;
  current: (typeof SUPPORTED_LANGUAGES)[number];
  onSelect: (code: LanguageCode) => void;
};

export default function LanguagePickerModal({ visible, onClose, current, onSelect }: LanguagePickerModalProps) {
  const s = styles(useColors());

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.title}>Idioma / Language / Idioma</Text>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isActive = lang.code === current.code;
            return (
              <TouchableOpacity key={lang.code} style={s.option} onPress={() => onSelect(lang.code)}>
                <Text style={[s.optionText, isActive && s.optionTextActive]}>{lang.label}</Text>
                {isActive && <Text style={s.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
