import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { FeedbackState } from '@/src/components/feedback';
import { useColors } from '@/src/theme';
import { TripPreferences } from '@/hooks/itineraryStore';
import { AssistantReply, REQUEST_MAX_LENGTH } from '../../hooks/useItineraryAssistant';
import { styles } from './styles';

type AssistantModalProps = {
  visible: boolean;
  draft: string;
  sending: boolean;
  error: string;
  replies: AssistantReply[];
  preferences?: TripPreferences | null;
  onChangeDraft: (text: string) => void;
  onSend: (text?: string) => void;
  onClose: () => void;
};

const SUGGESTIONS = ['lessChurches', 'calmer', 'free', 'nature', 'nightlife', 'history'] as const;

export default function AssistantModal({
  visible, draft, sending, error, replies, preferences, onChangeDraft, onSend, onClose,
}: AssistantModalProps) {
  const { t } = useTranslation('itinerario');
  const colors = useColors();
  const s = styles(colors);

  const chips = [
    ...(preferences?.moreCategories ?? []).map((c) => ({ key: `more-${c}`, label: t('assistant.more', { category: t(`assistant.categories.${c}`, { defaultValue: c }) }), positive: true })),
    ...(preferences?.lessCategories ?? []).map((c) => ({ key: `less-${c}`, label: t('assistant.less', { category: t(`assistant.categories.${c}`, { defaultValue: c }) }), positive: false })),
    ...(preferences?.avoidPaid ? [{ key: 'free', label: t('assistant.onlyFree'), positive: true }] : []),
    ...(preferences?.mustInclude ?? []).map((n) => ({ key: `inc-${n}`, label: n, positive: true })),
    ...(preferences?.exclude ?? []).map((n) => ({ key: `exc-${n}`, label: t('assistant.without', { name: n }), positive: false })),
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
          <TouchableOpacity style={s.sheet} activeOpacity={1}>
            <View style={s.handle} />
            <View style={s.titleRow}>
              <View style={s.titleIcon}>
                <Ionicons name="sparkles" size={18} color={colors.onPrimary} />
              </View>
              <View style={s.flex}>
                <Text style={s.title}>{t('assistant.title')}</Text>
                <Text style={s.subtitle}>{t('assistant.subtitle')}</Text>
              </View>
            </View>

            {chips.length > 0 && (
              <View style={s.prefsBox}>
                <Text style={s.prefsLabel}>{t('assistant.applied')}</Text>
                <View style={s.chipsWrap}>
                  {chips.map((chip) => (
                    <View key={chip.key} style={[s.prefChip, chip.positive ? s.prefChipPositive : s.prefChipNegative]}>
                      <Ionicons name={chip.positive ? 'add-circle' : 'remove-circle'} size={14} color={chip.positive ? colors.successText : colors.errorText} />
                      <Text style={s.prefChipText}>{chip.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <ScrollView style={s.chat} contentContainerStyle={s.chatContent} keyboardShouldPersistTaps="handled">
              {replies.map((reply, i) => (
                <View key={i}>
                  <View style={s.userBubble}>
                    <Text style={s.userText}>{reply.request}</Text>
                  </View>
                  <View style={s.botBubble}>
                    <Text style={s.botText}>{reply.summary}</Text>
                    <View style={s.sourceRow}>
                      <Ionicons name={reply.source === 'IA' ? 'sparkles' : 'flash-outline'} size={12} color={colors.textSubtle} />
                      <Text style={s.sourceText}>{t(reply.source === 'IA' ? 'assistant.sourceAi' : 'assistant.sourceRules')}</Text>
                    </View>
                  </View>
                </View>
              ))}

              {sending && (
                <View style={s.botBubble}>
                  <View style={s.sourceRow}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={s.botText}>{t('assistant.thinking')}</Text>
                  </View>
                </View>
              )}

              {replies.length === 0 && !sending && (
                <View style={s.chipsWrap}>
                  {SUGGESTIONS.map((key) => (
                    <TouchableOpacity key={key} style={s.suggestion} onPress={() => onSend(t(`assistant.suggestions.${key}`))} activeOpacity={0.8}>
                      <Text style={s.suggestionText}>{t(`assistant.suggestions.${key}`)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            {error ? <FeedbackState variant="error" layout="inline" message={error} style={s.feedback} /> : null}

            <View style={s.inputRow}>
              <TextInput
                value={draft}
                onChangeText={onChangeDraft}
                placeholder={t('assistant.placeholder')}
                placeholderTextColor={colors.placeholder}
                maxLength={REQUEST_MAX_LENGTH}
                style={s.input}
                multiline
                editable={!sending}
              />
              <TouchableOpacity
                style={[s.sendBtn, (!draft.trim() || sending) && s.sendBtnDisabled]}
                onPress={() => onSend()}
                disabled={!draft.trim() || sending}
                accessibilityRole="button"
                accessibilityLabel={t('assistant.send')}
              >
                <Ionicons name="arrow-up" size={20} color={colors.onPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={s.hint}>{t('assistant.hint')}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
