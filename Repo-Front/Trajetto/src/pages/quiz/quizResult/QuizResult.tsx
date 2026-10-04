import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/theme';
import { useQuizResult } from './hooks/useQuizResult';
import { styles } from './styles/styles';

export default function QuizResult() {
  const { t } = useTranslation('quiz');
  const colors = useColors();
  const s = styles(colors);
  const { perfil, fromProfile, goBack } = useQuizResult();

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

        <TouchableOpacity style={s.backButton} onPress={goBack} activeOpacity={0.85}>
          <Text style={s.backButtonText}>
            {fromProfile ? t('result.backToProfile') : t('result.startExploring')}
          </Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
