import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import CustomButton from '@/components/CustomButton';
import { FeedbackState } from '@/src/components/feedback';
import { useColors } from '@/src/theme';
import { NAME_MAX_LENGTH } from '../../hooks/useItineraryRename';
import { styles } from './styles';

type RenameModalProps = {
  visible: boolean;
  draft: string;
  genericName: string;
  saving: boolean;
  error: string;
  onChangeDraft: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function RenameModal({ visible, draft, genericName, saving, error, onChangeDraft, onSave, onCancel }: RenameModalProps) {
  const { t } = useTranslation('itinerario');
  const colors = useColors();
  const s = styles(colors);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onCancel}>
          <TouchableOpacity style={s.sheet} activeOpacity={1}>
            <View style={s.handle} />
            <Text style={s.title}>{t('renameModal.title')}</Text>
            <Text style={s.subtitle}>{t('renameModal.hint', { name: genericName })}</Text>

            <TextInput
              value={draft}
              onChangeText={onChangeDraft}
              placeholder={genericName}
              placeholderTextColor={colors.placeholder}
              maxLength={NAME_MAX_LENGTH}
              style={s.input}
              returnKeyType="done"
              onSubmitEditing={onSave}
              autoFocus
            />

            {error ? <FeedbackState variant="error" layout="inline" message={error} style={s.feedback} /> : null}

            <View style={s.actions}>
              <TouchableOpacity style={s.cancelBtn} onPress={onCancel} disabled={saving}>
                <Text style={s.cancelBtnText}>{t('renameModal.cancel')}</Text>
              </TouchableOpacity>
              <CustomButton
                title={t('renameModal.save')}
                onPress={onSave}
                loading={saving}
                disabled={saving}
                style={s.saveBtn}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
