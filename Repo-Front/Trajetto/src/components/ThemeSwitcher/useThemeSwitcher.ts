import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { THEME_PREFERENCES, ThemePreference, useTheme } from '@/src/theme';

export function useThemeSwitcher() {
  const { t } = useTranslation('common');
  const { preference, setPreference } = useTheme();
  const [open, setOpen] = useState(false);

  const options = THEME_PREFERENCES.map((value) => ({ value, label: t(`theme.${value}`) }));

  const select = async (value: string | null) => {
    if (value) await setPreference(value as ThemePreference);
    setOpen(false);
  };

  return {
    open,
    setOpen,
    title: t('theme.title'),
    currentLabel: t(`theme.${preference}`),
    preference,
    options,
    select,
  };
}
