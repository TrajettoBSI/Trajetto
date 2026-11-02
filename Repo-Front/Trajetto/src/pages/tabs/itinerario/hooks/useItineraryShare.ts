import { useMemo, useRef, useState } from 'react';
import { useWindowDimensions, type ViewInstance } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Itinerary } from '@/hooks/itineraryStore';
import { tripStats } from '@/src/domain/trip/tripStats';
import { useShareImage } from '@/src/components/share/useShareImage';
import { showAlert } from '@/src/components/alerts/alertService';

/** Largura do cartao na tela; a imagem compartilhada sai em 1080x1920 de qualquer jeito. */
export function storyCardWidth(windowWidth: number) {
  return Math.min(windowWidth - 72, 320);
}

export function useItineraryShare(itinerary: Itinerary | null) {
  const { t } = useTranslation('itinerario');
  const { width } = useWindowDimensions();
  const cardRef = useRef<ViewInstance>(null);
  const [visible, setVisible] = useState(false);
  const { share, sharing } = useShareImage(cardRef);
  const stats = useMemo(() => (itinerary ? tripStats(itinerary) : null), [itinerary]);

  const send = async () => {
    const ok = await share({ fileName: `trajetto-${itinerary?.city ?? 'roteiro'}`, dialogTitle: t('share.title') });
    if (!ok) showAlert(t('share.error'));
  };

  return {
    cardRef,
    visible,
    stats,
    sharing,
    cardWidth: storyCardWidth(width),
    open: () => setVisible(true),
    close: () => setVisible(false),
    send,
  };
}
