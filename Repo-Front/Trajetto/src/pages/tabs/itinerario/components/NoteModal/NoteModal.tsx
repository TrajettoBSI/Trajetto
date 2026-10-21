import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import CustomButton from '@/components/CustomButton';
import { Places } from '@/hooks/itineraryStore';
import { FeedbackState } from '@/src/components/feedback';
import { useColors } from '@/src/theme';
import { NOTE_MAX_LENGTH } from '../../hooks/useItineraryNote';
import { styles } from './styles';
import { placeName } from '@/src/i18n/format';

type NoteModalProps = {
  place: Places | null;
  draft: string;
  saving: boolean;
  error: string;
  onChangeDraft: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function NoteModal({ place, draft, saving, error, onChangeDraft, onSave, onCancel }: NoteModalProps) {
  const { t } = useTranslation('itinerario');
  const colors = useColors();
  const s = styles(colors);

  return (
    <Modal visible={place !== null} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onCancel}>
          <TouchableOpacity style={s.sheet} activeOpacity={1}>
            <View style={s.handle} />
            <Text style={s.title}>{t('noteModal.title')}</Text>
            {place && <Text style={s.subtitle} numberOfLines={1}>{placeName(place)}</Text>}

            <TextInput
              value={draft}
              onChangeText={onChangeDraft}
              placeholder={t('noteModal.placeholder')}
              placeholderTextColor={colors.placeholder}
              multiline
              maxLength={NOTE_MAX_LENGTH}
              style={s.input}
              textAlignVertical="top"
              autoFocus
            />
            <Text style={s.counter}>{draft.length}/{NOTE_MAX_LENGTH}</Text>

            {error ? <FeedbackState variant="error" layout="inline" message={error} style={s.feedback} /> : null}

            <View style={s.actions}>
              <TouchableOpacity style={s.cancelBtn} onPress={onCancel} disabled={saving}>
                <Text style={s.cancelBtnText}>{t('noteModal.cancel')}</Text>
              </TouchableOpacity>
              <CustomButton
                title={t('noteModal.save')}
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
