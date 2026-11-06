import React, { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { FeedbackState } from '@/src/components/feedback';
import PressableScale from '@/src/components/motion/PressableScale';
import { useColors } from '@/src/theme';
import { TripPreferences } from '@/hooks/itineraryStore';
import { AssistantReply, REQUEST_MAX_LENGTH, SuggestionChip } from '../../hooks/useItineraryAssistant';
import { styles } from './styles';

type AssistantModalProps = {
  visible: boolean;
  draft: string;
  sending: boolean;
  error: string;
  replies: AssistantReply[];
  suggestions: SuggestionChip[];
  preferences?: TripPreferences | null;
  onChangeDraft: (text: string) => void;
  onSend: (text?: string) => void;
  onClose: () => void;
};

function TypingDot({ index, color }: { index: number; color: string }) {
  const lift = useSharedValue(0);

  useEffect(() => {
    lift.value = withDelay(index * 130, withRepeat(withSequence(
      withTiming(-4, { duration: 260 }),
      withTiming(0, { duration: 260 }),
    ), -1));
  }, [index, lift]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: lift.value }] }));

  return <Animated.View style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }, style]} />;
}

export default function AssistantModal({
  visible, draft, sending, error, replies, suggestions, preferences, onChangeDraft, onSend, onClose,
}: AssistantModalProps) {
  const { t } = useTranslation('itinerario');
  const colors = useColors();
  const s = styles(colors);
  const chatRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const chips = [
    ...(preferences?.moreCategories ?? []).map((c) => ({ key: `more-${c}`, label: t('assistant.more', { category: t(`assistant.categories.${c}`, { defaultValue: c }) }), positive: true })),
    ...(preferences?.lessCategories ?? []).map((c) => ({ key: `less-${c}`, label: t('assistant.less', { category: t(`assistant.categories.${c}`, { defaultValue: c }) }), positive: false })),
    ...(preferences?.avoidPaid ? [{ key: 'free', label: t('assistant.onlyFree'), positive: true }] : []),
    ...(preferences?.walking === 'MENOS' ? [{ key: 'walk', label: t('assistant.lessWalking'), positive: true }] : []),
    ...(preferences?.mustInclude ?? []).map((n) => ({ key: `inc-${n}`, label: n, positive: true })),
    ...(preferences?.placements ?? []).map((p) => ({ key: `pin-${p.place}`, label: p.place, positive: true })),
    ...(preferences?.exclude ?? []).map((n) => ({ key: `exc-${n}`, label: t('assistant.without', { name: n }), positive: false })),
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
          <TouchableOpacity style={s.sheet} activeOpacity={1}>
            <View style={s.handle} />
            <View style={s.titleRow}>
              <LinearGradient colors={colors.gradientAction} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.titleIcon}>
                <Ionicons name="sparkles" size={18} color={colors.onPrimary} />
              </LinearGradient>
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

            <ScrollView
              ref={chatRef}
              style={s.chat}
              contentContainerStyle={s.chatContent}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => chatRef.current?.scrollToEnd({ animated: true })}
            >
              {replies.map((reply, i) => (
                <View key={i}>
                  <Animated.View entering={FadeInUp.duration(240)} style={s.userBubble}>
                    <LinearGradient colors={colors.gradientAction} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.userBubbleFill}>
                      <Text style={s.userText}>{reply.request}</Text>
                    </LinearGradient>
                  </Animated.View>
                  <Animated.View entering={FadeInUp.delay(120).duration(300)} style={s.botBubble}>
                    <Text style={s.botText}>{reply.summary}</Text>
                  </Animated.View>
                </View>
              ))}

              {sending && (
                <Animated.View entering={FadeInUp.duration(220)} style={s.botBubble}>
                  <View style={s.sourceRow}>
                    <View style={s.typing}>
                      {[0, 1, 2].map((i) => <TypingDot key={i} index={i} color={colors.primaryText} />)}
                    </View>
                    <Text style={s.botText}>{t('assistant.thinking')}</Text>
                  </View>
                </Animated.View>
              )}

              {!sending && suggestions.length > 0 && (
                <View>
                  <Text style={s.suggestionsTitle}>{t('assistant.suggestionsTitle')}</Text>
                  <View style={s.chipsWrap}>
                    {suggestions.map((suggestion, i) => (
                      <Animated.View key={suggestion.key} entering={FadeInDown.delay(i * 70).duration(280)}>
                        <PressableScale style={s.suggestion} onPress={() => onSend(suggestion.request)} scaleTo={0.95} haptic>
                          <Text style={s.suggestionText}>{suggestion.label}</Text>
                        </PressableScale>
                      </Animated.View>
                    ))}
                  </View>
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
              <PressableScale
                style={[s.sendBtn, (!draft.trim() || sending) && s.sendBtnDisabled]}
                onPress={() => onSend()}
                disabled={!draft.trim() || sending}
                scaleTo={0.88}
                accessibilityRole="button"
                accessibilityLabel={t('assistant.send')}
              >
                <Ionicons name="arrow-up" size={20} color={colors.onPrimary} />
              </PressableScale>
            </View>
            <Text style={s.hint}>{t('assistant.hint')}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}
