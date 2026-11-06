import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Itinerary, Places, useItineraryStore } from '@/hooks/itineraryStore';
import { getErrorMessage } from '@/utils/apiError';
import { AssistantSuggestion, assistantSuggestions } from '@/src/domain/itinerary/assistantSuggestions';

export const REQUEST_MAX_LENGTH = 500;

export type AssistantReply = {
  request: string;
  summary: string;
};

/** A sugestao pronta para a tela: o que ela mostra e o pedido que ela envia. */
export type SuggestionChip = {
  key: string;
  label: string;
  request: string;
};

export function useItineraryAssistant(itinerary: Itinerary | null, dayPlaces: Places[], dayIsRainy: boolean) {
  const { t, i18n } = useTranslation('itinerario');
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

  const suggestions = useMemo<SuggestionChip[]>(() => {
    if (!itinerary) return [];
    const chip = (suggestion: AssistantSuggestion): SuggestionChip => {
      const { key } = suggestion;
      if (key === 'calmer' || key === 'nature' || key === 'nightlife' || key === 'history' || key === 'lessChurches') {
        const text = t(`assistant.suggestions.${key}`);
        return { key, label: text, request: text };
      }
      const category = suggestion.category
        ? t(`assistant.categories.${suggestion.category}`, { defaultValue: suggestion.category })
        : undefined;
      const params = { km: suggestion.km, count: suggestion.count, total: suggestion.total, category };
      return { key, label: t(`assistant.smart.${key}.label`, params), request: t(`assistant.smart.${key}.request`, params) };
    };
    return assistantSuggestions(itinerary, dayPlaces, dayIsRainy).map(chip);
  }, [itinerary, dayPlaces, dayIsRainy, t]);

  const send = async (text?: string) => {
    const request = (text ?? draft).trim();
    if (!request || sending) return;
    setSending(true);
    setError('');
    try {
      const adjusted = await adjustItinerary(request, i18n.language);
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

  return { visible, draft, setDraft, sending, error, replies, suggestions, open, close, send };
}
