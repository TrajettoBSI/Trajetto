import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { useItineraryStore } from '@/hooks/itineraryStore';
import { getErrorMessage } from '@/utils/apiError';

export const REQUEST_MAX_LENGTH = 500;

export type AssistantReply = {
  request: string;
  summary: string;
};

export function useItineraryAssistant() {
  const { t } = useTranslation('itinerario');
  const adjustItinerary = useItineraryStore((state) => state.adjustItinerary);
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [replies, setReplies] = useState<AssistantReply[]>([]);

  const open = () => {
    setError('');
    setVisible(true);
  };

  const close = () => {
    if (!sending) setVisible(false);
  };

  const send = async (text?: string) => {
    const request = (text ?? draft).trim();
    if (!request || sending) return;
    setSending(true);
    setError('');
    try {
      const adjusted = await adjustItinerary(request);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setReplies((prev) => [...prev, {
        request,
        summary: adjusted.assistantSummary || t('assistant.defaultReply'),
      }]);
      setDraft('');
    } catch (e) {
      setError(getErrorMessage(e, t('assistant.error')));
    } finally {
      setSending(false);
    }
  };

  return { visible, draft, setDraft, sending, error, replies, open, close, send };
}
