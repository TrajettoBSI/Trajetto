import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/theme';
import { cityImage } from '@/src/helpers/cityImage';
import { cityName } from '@/src/i18n/format';
import { STORY_GRADIENT } from '@/src/components/share/storyStyles';
import { useQuizResult } from './hooks/useQuizResult';
import { styles } from './styles/styles';

export default function QuizResult() {
  const { t } = useTranslation('quiz');
  const colors = useColors();
  const s = styles(colors);
  const { perfil, fromProfile, firstTrip, goBack, startFirstTrip } = useQuizResult();
  const tripImage = cityImage(firstTrip.slug);

  if (!perfil) {
    return (
      <SafeAreaView style={s.container}>
        <Text style={s.errorText}>{t('result.notFound')}</Text>
        <TouchableOpacity onPress={goBack} style={s.backButton}>
          <Text style={s.backButtonText}>{t('result.back')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.content}>

        <View style={s.hero}>
          <Ionicons name="location-outline" size={18} color={colors.onPrimaryFaint20} style={[s.heroDecoration, { top: 18, left: 24 }]} />
          <Ionicons name="airplane-outline" size={20} color={colors.onPrimaryFaint20} style={[s.heroDecoration, { top: 14, right: 20, transform: [{ rotate: '20deg' }] }]} />
          <Ionicons name="compass-outline" size={18} color={colors.onPrimaryFaint20} style={[s.heroDecoration, { bottom: 18, left: 32 }]} />

          <View style={s.heroLabelRow}>
            <Ionicons name="trophy" size={14} color={colors.onPrimarySubtle} />
            <Text style={s.heroLabel}>{t('result.yourResult')}</Text>
          </View>

          <View style={s.emojiBadge}>
            <Text style={s.emoji}>{perfil.emoji}</Text>
          </View>

          <Text style={s.profileName}>{t(perfil.nome).toUpperCase()}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>{t('result.aboutYou')}</Text>
          <Text style={s.descricao}>{t(perfil.descricao)}</Text>
        </View>

        <View style={s.card}>
          <View style={s.cardTitleRow}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={s.cardTitle}>{t('result.matchingDestinations')}</Text>
          </View>
          {perfil.destinos_sugeridos.map((destino) => (
            <View key={destino} style={s.destinoRow}>
              <View style={s.destinoDot} />
              <Text style={s.destinoText}>{t(destino)}</Text>
            </View>
          ))}
        </View>

        {!fromProfile && (
          <TouchableOpacity style={s.tripCard} onPress={startFirstTrip} activeOpacity={0.9} accessibilityRole="button">
            {tripImage && <Image source={tripImage} style={s.tripImage} resizeMode="cover" />}
            <LinearGradient colors={STORY_GRADIENT} style={s.tripImage} />
            <Text style={s.tripKicker}>{t('firstTrip.kicker')}</Text>
            <Text style={s.tripTitle}>{t('firstTrip.title', { city: cityName(firstTrip.slug) })}</Text>
            <Text style={s.tripBody}>{t('firstTrip.body')}</Text>
            <View style={s.tripCta}>
              <Text style={s.tripCtaText}>{t('firstTrip.cta')}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={fromProfile ? s.backButton : s.secondaryButton} onPress={goBack} activeOpacity={0.85}>
          <Text style={fromProfile ? s.backButtonText : s.secondaryButtonText}>
            {fromProfile ? t('result.backToProfile') : t('result.startExploring')}
          </Text>
          {fromProfile && <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
