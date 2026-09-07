import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import CustomInput from '@/components/CustomInput';
import CountryPickerModal from '@/src/components/CountryPickerModal/CountryPickerModal';
import { useColors } from '@/src/theme';
import { useUserDetail } from './hooks/useUserDetail';
import { styles } from './styles/styles';

export default function UserDetail() {
  const { t } = useTranslation('admin');
  const colors = useColors();
  const s = styles(colors);
  const {
    firstName,
    lastName,
    email,
    birthDate,
    country,
    telephone,
    isAdmin,
    loading,
    showCountries,
    setFirstName,
    setLastName,
    setEmail,
    setBirthDate,
    setTelephone,
    onSelectCountry,
    openCountries,
    closeCountries,
    handleUpdate,
    handleRoleChange,
  } = useUserDetail();

  return (
    <KeyboardAvoidingView style={s.flex} behavior="padding" keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}>
      <ScrollView style={s.flex} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={s.avatarSection}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarEmoji}>👤</Text>
          </View>
          <Text style={s.avatarName}>{firstName} {lastName}</Text>
          <Text style={s.avatarEmail}>{email}</Text>
        </View>

        <Text style={s.sectionTitle}>{t('userDetail.personalInfo')}</Text>
        <View style={s.card}>
          <View style={s.row}>
            <CustomInput
              label={t('userDetail.firstNameLabel')}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t('userDetail.firstNamePlaceholder')}
              autoCapitalize="words"
              style={s.field}
            />
            <CustomInput
              label={t('userDetail.lastNameLabel')}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t('userDetail.lastNamePlaceholder')}
              autoCapitalize="words"
              style={s.field}
            />
          </View>

          <View style={s.row}>
            <CustomInput
              label={t('userDetail.birthDateLabel')}
              type="numeric"
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder={t('userDetail.birthDatePlaceholder')}
              style={s.field}
            />
            <CustomInput
              label={t('userDetail.telephoneLabel')}
              type="phone-pad"
              value={telephone}
              onChangeText={setTelephone}
              placeholder={t('userDetail.telephonePlaceholder')}
              style={s.field}
            />
          </View>

          <CustomInput
            label={t('userDetail.emailLabel')}
            type="email"
            value={email}
            onChangeText={setEmail}
            placeholder={t('userDetail.emailPlaceholder')}
            autoCapitalize="none"
          />

          <View style={s.field}>
            <Text style={s.fieldLabel}>{t('userDetail.countryLabel')}</Text>
            <TouchableOpacity style={s.dropdownTrigger} onPress={openCountries} activeOpacity={0.7}>
              <Text style={country ? s.dropdownValue : s.dropdownPlaceholder}>
                {country || t('userDetail.countryPlaceholder')}
              </Text>
              <Text style={s.dropdownChevron}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={s.sectionTitle}>{t('userDetail.roleSection')}</Text>
        <View style={s.card}>
          <Text style={s.roleInfo}>
            {t('userDetail.currentRole')}<Text style={s.roleValue}>{isAdmin ? t('userDetail.roleAdminValue') : t('userDetail.roleUserValue')}</Text>
          </Text>
          <View style={s.roleRow}>
            <TouchableOpacity
              style={[s.roleBtn, !isAdmin && s.roleBtnActive]}
              onPress={() => handleRoleChange(false)}
              activeOpacity={0.7}
            >
              <Text style={[s.roleBtnText, !isAdmin && s.roleBtnTextActive]}>{t('userDetail.roleUser')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.roleBtn, isAdmin && s.roleBtnActive]}
              onPress={() => handleRoleChange(true)}
              activeOpacity={0.8}
            >
              <Text style={[s.roleBtnText, isAdmin && s.roleBtnTextActive]}>{t('userDetail.roleAdmin')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={s.saveButton} onPress={handleUpdate} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator size="small" color={colors.white} />
            : <Text style={s.saveButtonText}>{t('userDetail.save')}</Text>
          }
        </TouchableOpacity>

      </ScrollView>

      <CountryPickerModal
        visible={showCountries}
        selected={country}
        onSelect={onSelectCountry}
        onClose={closeCountries}
      />
    </KeyboardAvoidingView>
  );
}
