import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Itinerary, useItineraryStore } from '@/hooks/itineraryStore';
import { getErrorMessage } from '@/utils/apiError';

export const NAME_MAX_LENGTH = 80;

export function useItineraryRename(itinerary: Itinerary | null) {
  const { t } = useTranslation('itinerario');
  const updateName = useItineraryStore((state) => state.updateName);
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const open = () => {
    setDraft(itinerary?.name ?? '');
    setError('');
    setVisible(true);
  };

  const close = () => {
    if (!saving) setVisible(false);
  };

  const save = async () => {
    if (!itinerary) return;
    setSaving(true);
    setError('');
    try {
      await updateName(itinerary.id, draft.trim() || null);
      setVisible(false);
    } catch (e) {
      setError(getErrorMessage(e, t('renameModal.error')));
    } finally {
      setSaving(false);
    }
  };

  return { visible, draft, setDraft, saving, error, open, close, save };
}
