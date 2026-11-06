import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import BrandMark from '@/src/components/brand/BrandMark';
import HeroFill from '@/src/components/brand/HeroFill';
import { useColors } from '@/src/theme';
import { FeedbackState } from '@/src/components/feedback';
import { useLogin } from './hooks/useLogin';
import { styles } from './styles/styles';

export default function Login() {
  const { t } = useTranslation('login');
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const s = styles(colors);
  const {
    email,
    password,
    loading,
    error,
    errors,
    setEmail,
    setPassword,
    handleLogin,
    goToForgotPassword,
    goToRegister,
  } = useLogin();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={s.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[s.hero, { paddingTop: insets.top + 32 }]}>
          <HeroFill />
          <Animated.View entering={FadeIn.duration(500)} style={s.logoBadge}>
            <BrandMark size={52} draw color={colors.onPrimary} />
          </Animated.View>
          <Animated.Text entering={FadeIn.delay(450).duration(600)} style={s.intro}>
            {t('intro')}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(250).duration(600)} style={s.brand}>
            trajetto
          </Animated.Text>
        </View>

        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={s.card}>
          <Text style={s.cardTitle}>{t('cardTitle')}</Text>
          <Text style={s.cardSubtitle}>{t('cardSubtitle')}</Text>

          {error ? (
            <FeedbackState variant="error" layout="inline" message={error} style={s.feedback} />
          ) : null}

          <CustomInput
            label={t('emailLabel')}
            type="email"
            value={email}
            onChangeText={setEmail}
            placeholder={t('emailPlaceholder')}
            autoCapitalize="none"
            error={errors.email}
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.gray400} style={s.inputIcon} />}
          />

          <CustomInput
            label={t('passwordLabel')}
            type="password"
            value={password}
            onChangeText={setPassword}
            placeholder={t('passwordPlaceholder')}
            error={errors.password}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.gray400} style={s.inputIcon} />}
          />

          <TouchableOpacity onPress={goToForgotPassword} style={s.forgotBtn}>
            <Text style={s.link}>{t('forgotPassword')}</Text>
          </TouchableOpacity>

          <CustomButton title={t('submit')} onPress={handleLogin} loading={loading} style={s.submitBtn} />

          <View style={s.registerRow}>
            <Text style={s.registerText}>{t('noAccount')}</Text>
            <TouchableOpacity onPress={goToRegister}>
              <Text style={s.registerLink}>{t('signUp')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
