import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/src/theme';
import { DESTINATIONS } from '@/src/pages/tabs/shared/data/destinations';
import DestinationCard from '@/src/pages/tabs/shared/components/DestinationCard/DestinationCard';
import { styles } from './styles';

export default function EmptyState({ destIndex }: { destIndex: number }) {
  const { t } = useTranslation('roteiros');
  const s = styles(useColors());
  const next1 = DESTINATIONS[(destIndex + 1) % DESTINATIONS.length];
  const next2 = DESTINATIONS[(destIndex + 2) % DESTINATIONS.length];
  const current = DESTINATIONS[destIndex];

  return (
    <View style={s.wrapper}>
      <View style={s.copyBlock}>
        <View style={s.copyRow}>
          <Text style={[s.emptyBody, s.emptyBodyTallLine]}>{t('emptyState.createFirst')}</Text>
          <Text style={s.emptyHighlight}>{t('emptyState.itinerary')}</Text>
        </View>

        <View style={s.copyRowTight}>
          <Text style={s.emptyHighlight}>{t('emptyState.personalized')}</Text>
          <Text style={[s.emptyBody, s.emptyBodyTallerLine]}>{t('emptyState.andStart')}</Text>
        </View>

        <Text style={[s.emptyBody, s.emptyBodyLast]}>{t('emptyState.explore')}</Text>
      </View>

      <View style={s.emptyState}>
        <View style={s.cardsStack}>
          <DestinationCard
            titleKey={current.titleKey}
            subtitleKey={current.subtitleKey}
            hours={current.hours}
            image={current.image}
            bgColor={current.bgColor}
            rotation="-6deg"
            style={{ position: 'absolute', left: 0, top: 20 }}
            animKey={destIndex}
          />
          <DestinationCard
            titleKey={next1.titleKey}
            subtitleKey={next1.subtitleKey}
            hours={next1.hours}
            image={next1.image}
            bgColor={next1.bgColor}
            rotation="4deg"
            style={{ position: 'absolute', left: 60, top: 0 }}
            animKey={destIndex}
          />
          <DestinationCard
            titleKey={next2.titleKey}
            subtitleKey={next2.subtitleKey}
            hours={next2.hours}
            image={next2.image}
            bgColor={next2.bgColor}
            rotation="-2deg"
            style={{ position: 'absolute', left: 120, top: 30 }}
            animKey={destIndex}
          />
        </View>
      </View>
    </View>
  );
}
