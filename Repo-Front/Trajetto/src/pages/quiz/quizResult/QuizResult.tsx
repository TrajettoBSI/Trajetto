import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/src/theme';
import { useQuizResult } from './hooks/useQuizResult';
import { styles } from './styles/styles';

export default function QuizResult() {
  const { t } = useTranslation('quiz');
  const s = styles(useColors());
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
          <Text style={s.trophy}>🏆</Text>
          <Text style={s.heroLabel}>{t('result.yourResult')}</Text>
          <Text style={s.emoji}>{perfil.emoji}</Text>
          <Text style={s.profileName}>{t(perfil.nome).toUpperCase()}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>{t('result.aboutYou')}</Text>
          <Text style={s.descricao}>{t(perfil.descricao)}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>{t('result.matchingDestinations')}</Text>
          {perfil.destinos_sugeridos.map((destino) => (
            <View key={destino} style={s.destinoRow}>
              <View style={s.destinoDot} />
              <Text style={s.destinoText}>{t(destino)}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.backButton} onPress={goBack}>
          <Text style={s.backButtonText}>
            {fromProfile ? t('result.backToProfile') : t('result.startExploring')}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
