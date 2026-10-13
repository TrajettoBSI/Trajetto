import { useEffect, useState } from 'react';
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
  resending: boolean;
  cooldown: number;
  handleResend: () => Promise<void>;
};

export const RESEND_COOLDOWN_SECONDS = 60;

export function useVerifyEmail(): VerifyEmailData {
  const { t } = useTranslation(['verifyEmail', 'common']);
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const emailStr = String(email ?? '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

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

  const handleResend = async () => {
    if (resending || cooldown > 0) return;
    setError('');
    setResending(true);
    try {
      await authService.resendVerificationCode(emailStr);
      setCode('');
      setCooldown(RESEND_COOLDOWN_SECONDS);
      showAlert(t('resendSuccess'));
    } catch (e) {
      setError(getErrorMessage(e, t('resendError')));
    } finally {
      setResending(false);
    }
  };

  return {
    email: emailStr, code, loading, error, handleVerify, handleChangeCode, resending, cooldown, handleResend,
  };
}
