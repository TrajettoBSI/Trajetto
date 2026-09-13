import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { quizData } from '@/data/quizData';
import { userService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/utils/apiError';
import { showAlert } from '@/src/components/alerts/alertService';

export type QuizResultData = {
  perfil: ReturnType<typeof getPerfil>;
  fromProfile: boolean;
  goBack: () => void;
};

function getPerfil(profile: string | undefined) {
  return quizData.perfis[profile ?? ''];
}

export function useQuizResult(): QuizResultData {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { profile, source } = useLocalSearchParams<{ profile: string; source?: string }>();
  const fromProfile = source === 'profile';

  const perfil = getPerfil(profile);

  useEffect(() => {
    if (profile) {
      userService.updateTravelerProfile(profile)
        .then(() => refreshUser())
        .catch((e) => showAlert(getErrorMessage(e), { title: t('error') }));
    }
  }, [profile, refreshUser, t]);

  return {
    perfil,
    fromProfile,
    goBack: () => (fromProfile ? router.dismiss(2) : router.replace('/(tabs)')),
  };
}
