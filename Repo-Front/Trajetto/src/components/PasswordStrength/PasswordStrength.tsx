import React from 'react';
import { Text, View, StyleProp, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { passwordStrength } from '@/utils/validators';
import { useColors } from '@/src/theme';
import { styles } from './styles';

export default function PasswordStrength({ password, style }: { password: string; style?: StyleProp<ViewStyle> }) {
  const { t } = useTranslation('common');
  const colors = useColors();
  const s = styles(colors);
  const strength = passwordStrength(password);

  const requirements = [
    { met: strength.length, label: t('passwordStrength.length') },
    { met: strength.uppercase && strength.lowercase, label: t('passwordStrength.case') },
    { met: strength.number, label: t('passwordStrength.number') },
    { met: strength.special, label: t('passwordStrength.special') },
  ];
  const missing = requirements.filter((r) => !r.met).map((r) => r.label);
  const filled = requirements.length - missing.length;
  const levelColor = [colors.error, colors.error, colors.warningBannerArrow, colors.primaryText, colors.success][filled];

  return (
    <View style={[s.container, style]}>
      <View
        style={s.strengthRow}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: requirements.length, now: filled }}
      >
        {requirements.map((_, i) => (
          <View
            key={i}
            testID={`password-strength-${i}`}
            style={[s.strengthBar, { backgroundColor: i < filled ? levelColor : colors.trackMuted }]}
          />
        ))}
      </View>
      {missing.length > 0 && (
        <Text style={s.missingText}>{t('passwordStrength.missing', { items: missing.join(', ') })}</Text>
      )}
    </View>
  );
}
