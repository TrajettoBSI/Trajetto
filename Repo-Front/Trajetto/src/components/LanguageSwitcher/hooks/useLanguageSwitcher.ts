import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setAppLanguage } from '@/src/i18n';
import { LanguageCode, SUPPORTED_LANGUAGES } from '@/src/i18n/languages';

export function useLanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const current = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) ?? SUPPORTED_LANGUAGES[0];

  const select = async (code: LanguageCode) => {
    await setAppLanguage(code);
    setOpen(false);
  };

  return {
    open,
    setOpen,
    current,
    languages: SUPPORTED_LANGUAGES,
    select,
  };
}
