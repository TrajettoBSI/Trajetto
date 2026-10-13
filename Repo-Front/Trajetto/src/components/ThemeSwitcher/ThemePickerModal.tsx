import React from 'react';
import OptionPickerModal from '@/src/components/OptionPickerModal/OptionPickerModal';
import { useThemeSwitcher } from './useThemeSwitcher';

type ThemePickerModalProps = {
  picker: ReturnType<typeof useThemeSwitcher>;
};

export default function ThemePickerModal({ picker }: ThemePickerModalProps) {
  return (
    <OptionPickerModal
      visible={picker.open}
      title={picker.title}
      options={picker.options}
      selected={picker.preference}
      onSelect={picker.select}
      onClose={() => picker.setOpen(false)}
    />
  );
}
