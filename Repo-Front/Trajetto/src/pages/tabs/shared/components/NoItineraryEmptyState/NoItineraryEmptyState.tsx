import React, { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/src/theme';
import IllustratedEmptyCard from '../IllustratedEmptyCard/IllustratedEmptyCard';
import { styles } from './styles';

type Props = {
  destIndex: number;
  title: string;
  background?: ReactNode;
};

export default function NoItineraryEmptyState({ destIndex, title, background }: Props) {
  const { t } = useTranslation('roteiros');
  const router = useRouter();
  const s = styles(useColors());

  return (
    <View style={s.safe}>
      {background && <View style={s.background} pointerEvents="none">{background}</View>}
      <SafeAreaView style={s.overlay} edges={['top', 'bottom']}>
        <Text style={s.headerTitle}>{title}</Text>
        <View style={s.center}>
          <IllustratedEmptyCard
            destIndex={destIndex}
            title={t('noItineraryEmptyState.title')}
            body={t('noItineraryEmptyState.body')}
            ctaLabel={t('noItineraryEmptyState.cta')}
            onPress={() => router.push({ pathname: '/', params: { openGenerate: '1' } })}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
