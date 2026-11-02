import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Itinerary, useItineraryStore } from '@/hooks/itineraryStore';
import { getErrorMessage } from '@/utils/apiError';

export const RATING_COMMENT_MAX_LENGTH = 500;

export function useItineraryRating(itinerary: Itinerary | null) {
  const { t } = useTranslation('itinerario');
  const rateItinerary = useItineraryStore((state) => state.rateItinerary);
  const savedComment = itinerary?.ratingDescription ?? '';
  const rating = itinerary?.rating ?? 0;

  const [draft, setDraft] = useState(savedComment);
  const [draftSource, setDraftSource] = useState(`${itinerary?.id}:${savedComment}`);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const source = `${itinerary?.id}:${savedComment}`;
  if (source !== draftSource) {
    setDraftSource(source);
    setDraft(savedComment);
  }

  const save = async (nextRating: number | null, comment: string | null) => {
    if (!itinerary) return;
    setSaving(true);
    setError('');
    try {
      await rateItinerary(itinerary.id, nextRating, comment);
    } catch (e) {
      setError(getErrorMessage(e, t('rating.error')));
    } finally {
      setSaving(false);
    }
  };

  const rate = (stars: number) => save(stars, savedComment || null);

  const saveComment = () => save(rating || null, draft.trim() || null);

  return {
    rating,
    draft,
    setDraft,
    commentChanged: draft.trim() !== savedComment,
    saving,
    error,
    rate,
    saveComment,
  };
}
