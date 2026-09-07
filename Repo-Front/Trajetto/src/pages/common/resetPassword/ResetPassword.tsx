import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import CustomInput from '@/components/CustomInput';
import PasswordStrength from '@/src/components/PasswordStrength/PasswordStrength';
import { useColors } from '@/src/theme';
import { useResetPassword } from './hooks/useResetPassword';
import { styles } from './styles/styles';

export default function ResetPassword() {
  const { t } = useTranslation('resetPassword');
  const router = useRouter();
  const colors = useColors();
  const s = styles(colors);
  const {
    email,
    code,
    password,
    loading,
    errors,
    onChangeEmail,
    onChangeCode,
    onChangePassword,
    handleReset,
  } = useResetPassword();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={s.card}>
          <Text style={s.cardTitle}>{t('cardTitle')}</Text>
          <Text style={s.cardSub}>{t('instructions')}</Text>

          <CustomInput
            label={t('emailLabel')}
            type="email"
            value={email}
            onChangeText={onChangeEmail}
            placeholder={t('emailPlaceholder')}
            autoCapitalize="none"
            error={errors.email}
          />

          <CustomInput
            label={t('codeLabel')}
            type="numeric"
            value={code}
            onChangeText={onChangeCode}
            placeholder="000000"
            maxLength={6}
            error={errors.code}
          />

          <CustomInput
            label={t('newPasswordLabel')}
            type="password"
            value={password}
            onChangeText={onChangePassword}
            placeholder={t('newPasswordPlaceholder')}
            error={errors.password}
          />

          {password.length > 0 && <PasswordStrength password={password} style={s.strength} />}

          <TouchableOpacity
            style={[s.loginBtn, loading && s.loginBtnDisabled]}
            onPress={handleReset}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={s.loginBtnText}>{loading ? t('submitting') : t('submit')}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.registerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.registerLink}>{t('back')}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
