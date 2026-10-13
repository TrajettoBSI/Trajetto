import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Places, useItineraryStore } from '@/hooks/itineraryStore';
import { getErrorMessage } from '@/utils/apiError';

export const NOTE_MAX_LENGTH = 1000;

export function useItineraryNote() {
  const { t } = useTranslation('itinerario');
  const updateNote = useItineraryStore((state) => state.updateNote);
  const [notePlace, setNotePlace] = useState<Places | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openNote = (place: Places) => {
    setNotePlace(place);
    setDraft(place.note ?? '');
    setError('');
  };

  const closeNote = () => {
    if (saving) return;
    setNotePlace(null);
  };

  const saveNote = async () => {
    if (!notePlace) return;
    setSaving(true);
    setError('');
    try {
      await updateNote(notePlace.orderIndex, draft.trim() ? draft : null);
      setNotePlace(null);
    } catch (e) {
      setError(getErrorMessage(e, t('noteModal.saveError')));
    } finally {
      setSaving(false);
    }
  };

  return { notePlace, noteDraft: draft, setNoteDraft: setDraft, savingNote: saving, noteError: error, openNote, closeNote, saveNote };
}
