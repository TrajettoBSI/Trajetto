import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services';
import {
  maskName, maskBirthDate, maskTelephone,
  validateProfileForm, toBirthDateISO, fromBirthDateISO,
} from '@/utils/validators';
import { getErrorMessage, getFieldErrors } from '@/utils/apiError';
import { showAlert } from '@/src/components/alerts/alertService';
import { AsyncData, useAsyncData } from '@/src/components/feedback';
import { User } from '@/types/user';

type Errors = Record<string, string>;

export type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  country: string;
  telephone: string;
  loading: boolean;
  error: string;
  perfil: AsyncData<User>;
  showCountries: boolean;
  errors: Errors;
  logout: () => Promise<void>;
  onChangeFirstName: (t: string) => void;
  onChangeLastName: (t: string) => void;
  onChangeBirthDate: (t: string) => void;
  onChangeTelephone: (t: string) => void;
  onChangeEmail: (t: string) => void;
  onSelectCountry: (c: string) => void;
  openCountries: () => void;
  closeCountries: () => void;
  handleUpdate: () => Promise<void>;
};

export function useProfile(): ProfileData {
  const { t } = useTranslation(['profile', 'common']);
  const { logout } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCountries, setShowCountries] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  // Os campos são preenchidos quando a resposta chega; a partir daí eles são do usuário,
  // e só uma nova busca volta a mexer neles.
  const perfil = useAsyncData<User>(async () => {
    const u = await userService.getProfile();
    setFirstName(u.firstName ?? '');
    setLastName(u.lastName ?? '');
    setEmail(u.email ?? '');
    setBirthDate(u.birthDate ? fromBirthDateISO(u.birthDate) : '');
    setCountry(u.country ?? '');
    setTelephone(u.telephone ?? '');
    return u;
  });

  const clearError = (field: string) => {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleUpdate = async () => {
    const errs = validateProfileForm({ firstName, lastName, birthDate, telephone, email, country });
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setError('');
    try {
      setLoading(true);
      await userService.updateProfile({ firstName, lastName, email, birthDate: toBirthDateISO(birthDate), country, telephone });
      showAlert(t('profile:updateSuccess'), { title: t('common:success') });
    } catch (e) {
      const fieldErrors = getFieldErrors(e);
      if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
      setError(getErrorMessage(e, t('profile:updateError')));
    } finally {
      setLoading(false);
    }
  };

  return {
    firstName,
    lastName,
    email,
    birthDate,
    country,
    telephone,
    loading,
    error,
    perfil,
    showCountries,
    errors,
    logout,
    onChangeFirstName: (t) => { setFirstName(maskName(t)); clearError('firstName'); },
    onChangeLastName: (t) => { setLastName(maskName(t)); clearError('lastName'); },
    onChangeBirthDate: (t) => { setBirthDate(maskBirthDate(t)); clearError('birthDate'); },
    onChangeTelephone: (t) => { setTelephone(maskTelephone(t)); clearError('telephone'); },
    onChangeEmail: (t) => { setEmail(t); clearError('email'); },
    onSelectCountry: (c) => { setCountry(c); setShowCountries(false); clearError('country'); },
    openCountries: () => setShowCountries(true),
    closeCountries: () => setShowCountries(false),
    handleUpdate,
  };
}
