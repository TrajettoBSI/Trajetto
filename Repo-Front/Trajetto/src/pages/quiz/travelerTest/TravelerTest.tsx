import React from 'react';
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/src/theme';
import { useTravelerTest } from './hooks/useTravelerTest';
import { styles } from './styles/styles';

export default function TravelerTest() {
  const { t } = useTranslation('quiz');
  const colors = useColors();
  const s = styles(colors);
  const { fromProfile, skipping, handleSkip, goToQuiz } = useTravelerTest();

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <Text style={s.icon}>✈️</Text>
        <Text style={s.title}>{t('travelerTest.title')}</Text>
        <Text style={s.subtitle}>{t('travelerTest.subtitle')}</Text>

        {fromProfile && (
          <View style={s.retakeBadge}>
            <Ionicons name="sync" size={16} color={colors.white} />
            <Text style={s.retakeBadgeText}>{t('travelerTest.retaking')}</Text>
          </View>
        )}

        <View style={s.dots}>
          <View style={[s.dot, s.dotActive]} />
          <View style={s.dot} />
          <View style={s.dot} />
        </View>
      </View>

      <View style={s.buttons}>
        <TouchableOpacity style={s.primaryButton} onPress={goToQuiz}>
          <Text style={s.primaryButtonText}>{t('travelerTest.start')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.secondaryButton}
          onPress={handleSkip}
          disabled={skipping}
          activeOpacity={0.75}
        >
          {skipping ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={s.secondaryButtonText}>
              {fromProfile ? t('travelerTest.cancel') : t('travelerTest.skip')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
