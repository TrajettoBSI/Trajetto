import { useState } from 'react';
import { Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services';
import { getErrorMessage } from '@/utils/apiError';
import { showAlert } from '@/src/components/alerts/alertService';

export type VerifyEmailData = {
  email: string;
  code: string;
  loading: boolean;
  error: string;
  handleVerify: (manualCode?: string) => Promise<void>;
  handleChangeCode: (text: string) => void;
};

export function useVerifyEmail(): VerifyEmailData {
  const { t } = useTranslation(['verifyEmail', 'common']);
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const emailStr = String(email ?? '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (manualCode?: string) => {
    const codeToVerify = manualCode ?? code;
    Keyboard.dismiss();
    if (codeToVerify.length < 6) {
      setError(t('codeTooShortMessage'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.verifyEmail(emailStr, codeToVerify);
      showAlert(t('successMessage'), { title: t('successTitle') });
      router.replace('/LoginScreen');
    } catch (e) {
      setError(getErrorMessage(e, t('verifyError')));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeCode = (text: string) => {
    setCode(text);
    if (error) setError('');
    if (text.length === 6) {
      Keyboard.dismiss();
      setTimeout(() => handleVerify(text), 150);
    }
  };

  return { email: emailStr, code, loading, error, handleVerify, handleChangeCode };
}
