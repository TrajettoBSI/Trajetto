import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services';
import { validateEmail } from '@/utils/validators';
import { getErrorMessage } from '@/utils/apiError';
import { showAlert } from '@/src/components/alerts/alertService';

export type ForgotPasswordData = {
  email: string;
  loading: boolean;
  error: string;
  errors: Record<string, string>;
  onChangeEmail: (t: string) => void;
  handleSend: () => Promise<void>;
};

export function useForgotPassword(): ForgotPasswordData {
  const { t } = useTranslation(['forgotPassword', 'common']);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSend = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }
    setErrors({});
    setError('');
    try {
      setLoading(true);
      await authService.requestPasswordCode(email);
      showAlert(t('codeSentMessage'), {
        title: t('codeSentTitle'),
        buttons: [
          {
            text: 'OK',
            onPress: () => router.push({ pathname: '/ResetPasswordScreen', params: { email: email.trim().toLowerCase() } }),
          },
        ],
      });
    } catch (e) {
      setError(getErrorMessage(e, t('sendError')));
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    loading,
    error,
    errors,
    onChangeEmail: (t) => {
      setEmail(t);
      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
    },
    handleSend,
  };
}
