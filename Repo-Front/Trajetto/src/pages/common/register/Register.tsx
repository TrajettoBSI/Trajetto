import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import Logo from '@/assets/appImgs/logo.svg';
import { useColors } from '@/src/theme';
import { useRegister } from './hooks/useRegister';
import { styles } from './styles/styles';
import PasswordStrength from '@/src/components/PasswordStrength/PasswordStrength';
import CountryPickerModal from '@/src/components/CountryPickerModal/CountryPickerModal';
import OptionPickerModal from '@/src/components/OptionPickerModal/OptionPickerModal';

export default function Register() {
  const { t } = useTranslation('register');
  const router = useRouter();
  const colors = useColors();
  const s = styles(colors);
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    birthDate,
    country,
    telephone,
    novoCampoId,
    novoCampoOpcoes,
    loading,
    errors,
    showCountries,
    showNovoCampo,
    onChangeFirstName,
    onChangeLastName,
    onChangeBirthDate,
    onChangeTelephone,
    onChangeEmail,
    onChangePassword,
    onChangeConfirmPassword,
    onSelectCountry,
    openCountries,
    closeCountries,
    onSelectNovoCampo,
    openNovoCampo,
    closeNovoCampo,
    handleRegister,
    goToLogin,
  } = useRegister();

  const selectedNovoCampo = novoCampoOpcoes.find((o) => o.id === novoCampoId);

  return (
    <KeyboardAvoidingView style={s.flex} behavior="padding" keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}>
      <ScrollView style={s.scrollView} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>

        <View style={s.headerWrapper}>
          <View style={s.headerRow}>
            <View style={s.headerLeft}>
              <TouchableOpacity onPress={() => router.back()} style={s.headerBackBtn} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={32} color={colors.white} />
              </TouchableOpacity>
              <Text style={s.headerText}>{t('headerTitle')}</Text>
            </View>

            <View style={s.headerCenter} pointerEvents="none">
              <View style={s.logoBadge}>
                <Logo width={20} height={20} color={colors.primary} />
              </View>
            </View>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>{t('cardTitle')}</Text>

          <View style={s.row}>
            <CustomInput
              label={t('firstNameLabel')}
              value={firstName}
              onChangeText={onChangeFirstName}
              placeholder={t('firstNamePlaceholder')}
              autoCapitalize="words"
              error={errors.firstName}
              style={s.field}
            />
            <CustomInput
              label={t('lastNameLabel')}
              value={lastName}
              onChangeText={onChangeLastName}
              placeholder={t('lastNamePlaceholder')}
              autoCapitalize="words"
              error={errors.lastName}
              style={s.field}
            />
          </View>

          <View style={s.row}>
            <CustomInput
              label={t('birthDateLabel')}
              type="numeric"
              value={birthDate}
              onChangeText={onChangeBirthDate}
              placeholder={t('birthDatePlaceholder')}
              maxLength={10}
              error={errors.birthDate}
              style={s.field}
            />
            <CustomInput
              label={t('telephoneLabel')}
              type="phone-pad"
              value={telephone}
              onChangeText={onChangeTelephone}
              placeholder={t('telephonePlaceholder')}
              maxLength={15}
              error={errors.telephone}
              style={s.field}
            />
          </View>

          <CustomInput
            label={t('emailLabel')}
            type="email"
            value={email}
            onChangeText={onChangeEmail}
            placeholder={t('emailPlaceholder')}
            autoCapitalize="none"
            error={errors.email}
          />

          <View style={s.field}>
            <Text style={s.label}>{t('countryLabel')}</Text>
            <TouchableOpacity
              style={[s.dropdownTrigger, errors.country ? s.inputError : null]}
              onPress={openCountries}
              activeOpacity={0.7}
            >
              <Text style={country ? s.dropdownValue : s.dropdownPlaceholder}>
                {country || t('countryPlaceholder')}
              </Text>
              <Text style={s.dropdownChevron}>▼</Text>
            </TouchableOpacity>
            {errors.country ? <Text style={s.errorText}>{errors.country}</Text> : null}
          </View>

          <CountryPickerModal
            visible={showCountries}
            selected={country}
            onSelect={onSelectCountry}
            onClose={closeCountries}
          />

          {/* TROCAR: os textos deste campo (título, placeholder e mensagem de obrigatório) ficam
              nas chaves novoCampoLabel, novoCampoPlaceholder e novoCampoRequired dos 3 arquivos
              src/i18n/locales/{pt-BR,en-US,es-ES}/register.json. As opções vêm do INSERT da migração. */}
          <View style={s.field}>
            <Text style={s.label}>{t('novoCampoLabel')}</Text>
            <TouchableOpacity
              style={[s.dropdownTrigger, errors.novoCampoId ? s.inputError : null]}
              onPress={openNovoCampo}
              activeOpacity={0.7}
            >
              <Text style={selectedNovoCampo ? s.dropdownValue : s.dropdownPlaceholder}>
                {selectedNovoCampo ? selectedNovoCampo.name : t('novoCampoPlaceholder')}
              </Text>
              <Text style={s.dropdownChevron}>▼</Text>
            </TouchableOpacity>
            {errors.novoCampoId ? <Text style={s.errorText}>{errors.novoCampoId}</Text> : null}
          </View>

          <OptionPickerModal
            visible={showNovoCampo}
            title={t('novoCampoLabel')}
            options={novoCampoOpcoes.map((o) => ({ value: String(o.id), label: o.name }))}
            selected={novoCampoId !== null ? String(novoCampoId) : null}
            onSelect={(value) => { if (value !== null) onSelectNovoCampo(Number(value)); }}
            onClose={closeNovoCampo}
          />

          <CustomInput
            label={t('passwordLabel')}
            type="password"
            value={password}
            onChangeText={onChangePassword}
            placeholder={t('passwordPlaceholder')}
            error={errors.password}
          />
          {password.length > 0 && <PasswordStrength password={password} />}

          <CustomInput
            label={t('confirmPasswordLabel')}
            type="password"
            value={confirmPassword}
            onChangeText={onChangeConfirmPassword}
            placeholder={t('confirmPasswordPlaceholder')}
            returnKeyType="done"
            error={errors.confirmPassword}
            inputStyle={confirmPassword.length > 0 && password === confirmPassword ? s.inputOk : null}
          />

          <CustomButton title={t('submit')} onPress={handleRegister} loading={loading} style={s.button} />

          <TouchableOpacity onPress={goToLogin} style={s.loginLink}>
            <Text style={s.loginLinkText}>{t('haveAccount')}<Text style={s.loginLinkBold}>{t('signIn')}</Text></Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
