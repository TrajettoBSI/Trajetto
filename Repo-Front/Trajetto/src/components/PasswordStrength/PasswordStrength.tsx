import React from 'react';
import { Text, View, StyleProp, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { passwordStrength } from '@/utils/validators';
import { useColors } from '@/src/theme';
import { styles } from './styles';

export default function PasswordStrength({ password, style }: { password: string; style?: StyleProp<ViewStyle> }) {
  const { t } = useTranslation('common');
  const s = styles(useColors());
  const strength = passwordStrength(password);

  const requirements = [
    { met: strength.length, label: t('passwordStrength.length') },
    { met: strength.uppercase && strength.lowercase, label: t('passwordStrength.case') },
    { met: strength.number, label: t('passwordStrength.number') },
    { met: strength.special, label: t('passwordStrength.special') },
  ];
  const missing = requirements.filter((r) => !r.met).map((r) => r.label);

  return (
    <View style={[s.container, style]}>
      <View style={s.strengthRow}>
        {requirements.map((req, i) => (
          <View key={i} style={[s.strengthBar, req.met ? s.strengthOk : s.strengthWeak]} />
        ))}
      </View>
      {missing.length > 0 && (
        <Text style={s.missingText}>{t('passwordStrength.missing', { items: missing.join(', ') })}</Text>
      )}
    </View>
  );
}
