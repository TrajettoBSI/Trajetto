import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import CustomButton from '@/components/CustomButton';
import { useColors } from '@/src/theme';
import { DESTINATIONS } from '../../data/destinations';
import DestinationCard from '../DestinationCard/DestinationCard';
import { styles } from './styles';

export default function NoItineraryEmptyState({ destIndex }: { destIndex: number }) {
  const { t } = useTranslation('roteiros');
  const router = useRouter();
  const s = styles(useColors());
  const current = DESTINATIONS[destIndex];
  const next1 = DESTINATIONS[(destIndex + 1) % DESTINATIONS.length];
  const next2 = DESTINATIONS[(destIndex + 2) % DESTINATIONS.length];

  return (
    <View style={s.wrapper}>
      <View style={s.copyBlock}>
        <Text style={[s.emptyBody, s.emptyBodyFirst]}>
          {t('noItineraryEmptyState.generate')}
        </Text>
        <View style={s.copyRow}>
          <Text style={[s.emptyBody, s.emptyBodyTallLine]}>{t('noItineraryEmptyState.andPlan')}</Text>
          <Text style={s.emptyHighlight}>Trajetto</Text>
        </View>
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

      <View style={s.buttonWrapper}>
        <CustomButton
          title={t('noItineraryEmptyState.goHome')}
          onPress={() => router.push('/')}
        />
      </View>
    </View>
  );
}
