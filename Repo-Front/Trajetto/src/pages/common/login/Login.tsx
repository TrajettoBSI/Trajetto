import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import Logo from '@/assets/appImgs/logo.svg';
import { useColors } from '@/src/theme';
import { useLogin } from './hooks/useLogin';
import { styles } from './styles/styles';

export default function Login() {
  const { t } = useTranslation('login');
  const colors = useColors();
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
        <View style={s.header}>
          <View>
            <Animated.Text entering={FadeIn.delay(1000).duration(800)} style={s.intro}>
              {t('intro')}
            </Animated.Text>
            <View style={s.titleRow}>
              <Animated.View entering={FadeIn.duration(800)} style={s.logoContainer}>
                <Logo width={40} height={40} color={colors.primary} />
              </Animated.View>
              <Animated.Text entering={SlideInRight.duration(800)} style={s.brand}>
                Trajetto
              </Animated.Text>
            </View>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>{t('cardTitle')}</Text>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorBoxText}>{error}</Text>
            </View>
          ) : null}

          <CustomInput
            label={t('emailLabel')}
            type="email"
            value={email}
            onChangeText={setEmail}
            placeholder={t('emailPlaceholder')}
            autoCapitalize="none"
            error={errors.email}
          />

          <CustomInput
            label={t('passwordLabel')}
            type="password"
            value={password}
            onChangeText={setPassword}
            placeholder={t('passwordPlaceholder')}
            error={errors.password}
          />

          <TouchableOpacity onPress={goToForgotPassword}>
            <Text style={s.link}>{t('forgotPassword')}</Text>
          </TouchableOpacity>

          <CustomButton title={t('submit')} onPress={handleLogin} loading={loading} />

          <View style={s.registerRow}>
            <Text style={s.registerText}>{t('noAccount')}</Text>
            <TouchableOpacity onPress={goToRegister}>
              <Text style={s.registerLink}>{t('signUp')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
