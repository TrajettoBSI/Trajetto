import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services';
import { validateEmail, validatePassword } from '@/utils/validators';
import { getErrorMessage } from '@/utils/apiError';
import { showAlert } from '@/src/components/alerts/alertService';

export type ResetPasswordData = {
  email: string;
  code: string;
  password: string;
  loading: boolean;
  error: string;
  errors: Record<string, string>;
  onChangeEmail: (t: string) => void;
  onChangeCode: (t: string) => void;
  onChangePassword: (t: string) => void;
  handleReset: () => Promise<void>;
};

export function useResetPassword(): ResetPasswordData {
  const { t } = useTranslation(['resetPassword', 'common']);
  const router = useRouter();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState((params.email as string) || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleReset = async () => {
    const newErrors: Record<string, string> = {};
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;
    if (!code) newErrors.code = t('codeRequired');
    else if (!/^\d{6}$/.test(code)) newErrors.code = t('codeInvalidLength');
    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setError('');
    try {
      setLoading(true);
      await authService.resetPassword({ email, code, newPassword: password });
      showAlert(t('successMessage'), {
        title: t('successTitle'),
        buttons: [{ text: 'OK', onPress: () => router.replace('/LoginScreen') }],
      });
    } catch (e) {
      setError(getErrorMessage(e, t('resetError')));
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    code,
    password,
    loading,
    error,
    errors,
    onChangeEmail: (t) => { setEmail(t); clearError('email'); },
    onChangeCode: (t) => { setCode(t.replace(/\D/g, '')); clearError('code'); },
    onChangePassword: (t) => { setPassword(t); clearError('password'); },
    handleReset,
  };
}
