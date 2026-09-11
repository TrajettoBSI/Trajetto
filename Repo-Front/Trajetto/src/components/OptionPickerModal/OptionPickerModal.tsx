import React from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/src/theme';
import { styles } from './styles';

export type PickerOption = {
  /** `null` é a opção que desfaz a escolha ("Todos"). */
  value: string | null;
  label: string;
};

type OptionPickerModalProps = {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selected: string | null;
  onSelect: (value: string | null) => void;
  onClose: () => void;
  emptyText?: string;
};

/**
 * Folha de seleção de uma opção entre várias.
 *
 * É o `CountryPickerModal` sem a lista fixa de países: aqui as opções vêm de
 * fora, podem incluir a escolha vazia ("Todos") e carregam um rótulo próprio
 * para exibição. Serve qualquer seletor que caiba em uma lista - no painel
 * gerencial, os quatro do filtro.
 */
export default function OptionPickerModal({
  visible, title, options, selected, onSelect, onClose, emptyText,
}: OptionPickerModalProps) {
  const s = styles(useColors());

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />
          <Text style={s.modalTitle}>{title}</Text>
          {options.length === 0 && emptyText ? (
            <Text style={s.emptyText}>{emptyText}</Text>
          ) : (
            <FlatList
              data={options}
              keyExtractor={(item) => item.value ?? '__todos__'}
              renderItem={({ item }) => {
                const escolhido = selected === item.value;
                return (
                  <TouchableOpacity style={s.modalItem} onPress={() => onSelect(item.value)}>
                    <Text style={[s.modalItemText, escolhido && s.modalItemSelected]}>
                      {item.label}
                    </Text>
                    {escolhido && <Text style={s.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
