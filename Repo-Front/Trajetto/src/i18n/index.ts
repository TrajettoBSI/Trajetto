import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_LANGUAGE, isSupportedLanguage, LanguageCode } from './languages';

import ptBRCommon from './locales/pt-BR/common.json';
import ptBRValidation from './locales/pt-BR/validation.json';
import ptBRLogin from './locales/pt-BR/login.json';
import ptBRRegister from './locales/pt-BR/register.json';
import ptBRForgotPassword from './locales/pt-BR/forgotPassword.json';
import ptBRResetPassword from './locales/pt-BR/resetPassword.json';
import ptBRVerifyEmail from './locales/pt-BR/verifyEmail.json';
import ptBRQuiz from './locales/pt-BR/quiz.json';
import ptBRProfile from './locales/pt-BR/profile.json';
import ptBRExplore from './locales/pt-BR/explore.json';
import ptBRSpotDetail from './locales/pt-BR/spotDetail.json';
import ptBRAdmin from './locales/pt-BR/admin.json';
import ptBRRoteiros from './locales/pt-BR/roteiros.json';
import ptBRItinerario from './locales/pt-BR/itinerario.json';
import ptBRMapa from './locales/pt-BR/mapa.json';

import enUSCommon from './locales/en-US/common.json';
import enUSValidation from './locales/en-US/validation.json';
import enUSLogin from './locales/en-US/login.json';
import enUSRegister from './locales/en-US/register.json';
import enUSForgotPassword from './locales/en-US/forgotPassword.json';
import enUSResetPassword from './locales/en-US/resetPassword.json';
import enUSVerifyEmail from './locales/en-US/verifyEmail.json';
import enUSQuiz from './locales/en-US/quiz.json';
import enUSProfile from './locales/en-US/profile.json';
import enUSExplore from './locales/en-US/explore.json';
import enUSSpotDetail from './locales/en-US/spotDetail.json';
import enUSAdmin from './locales/en-US/admin.json';
import enUSRoteiros from './locales/en-US/roteiros.json';
import enUSItinerario from './locales/en-US/itinerario.json';
import enUSMapa from './locales/en-US/mapa.json';

import esESCommon from './locales/es-ES/common.json';
import esESValidation from './locales/es-ES/validation.json';
import esESLogin from './locales/es-ES/login.json';
import esESRegister from './locales/es-ES/register.json';
import esESForgotPassword from './locales/es-ES/forgotPassword.json';
import esESResetPassword from './locales/es-ES/resetPassword.json';
import esESVerifyEmail from './locales/es-ES/verifyEmail.json';
import esESQuiz from './locales/es-ES/quiz.json';
import esESProfile from './locales/es-ES/profile.json';
import esESExplore from './locales/es-ES/explore.json';
import esESSpotDetail from './locales/es-ES/spotDetail.json';
import esESAdmin from './locales/es-ES/admin.json';
import esESRoteiros from './locales/es-ES/roteiros.json';
import esESItinerario from './locales/es-ES/itinerario.json';
import esESMapa from './locales/es-ES/mapa.json';

export const LANGUAGE_STORAGE_KEY = 'app_language';

const resources = {
  'pt-BR': {
    common: ptBRCommon, validation: ptBRValidation, login: ptBRLogin, register: ptBRRegister,
    forgotPassword: ptBRForgotPassword, resetPassword: ptBRResetPassword, verifyEmail: ptBRVerifyEmail,
    quiz: ptBRQuiz, profile: ptBRProfile, explore: ptBRExplore, spotDetail: ptBRSpotDetail,
    admin: ptBRAdmin, roteiros: ptBRRoteiros, itinerario: ptBRItinerario, mapa: ptBRMapa,
  },
  'en-US': {
    common: enUSCommon, validation: enUSValidation, login: enUSLogin, register: enUSRegister,
    forgotPassword: enUSForgotPassword, resetPassword: enUSResetPassword, verifyEmail: enUSVerifyEmail,
    quiz: enUSQuiz, profile: enUSProfile, explore: enUSExplore, spotDetail: enUSSpotDetail,
    admin: enUSAdmin, roteiros: enUSRoteiros, itinerario: enUSItinerario, mapa: enUSMapa,
  },
  'es-ES': {
    common: esESCommon, validation: esESValidation, login: esESLogin, register: esESRegister,
    forgotPassword: esESForgotPassword, resetPassword: esESResetPassword, verifyEmail: esESVerifyEmail,
    quiz: esESQuiz, profile: esESProfile, explore: esESExplore, spotDetail: esESSpotDetail,
    admin: esESAdmin, roteiros: esESRoteiros, itinerario: esESItinerario, mapa: esESMapa,
  },
};

const detectInitialLanguage = (): LanguageCode => {
  const deviceTag = Localization.getLocales()[0]?.languageTag;
  return deviceTag && isSupportedLanguage(deviceTag) ? deviceTag : DEFAULT_LANGUAGE;
};

i18n.use(initReactI18next).init({
  resources,
  lng: detectInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  ns: Object.keys(resources['pt-BR']),
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// Sobrepoe pelo idioma que o usuario escolheu manualmente, se houver.
AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((saved) => {
  if (saved && isSupportedLanguage(saved) && saved !== i18n.language) {
    i18n.changeLanguage(saved);
  }
});

export async function setAppLanguage(code: LanguageCode): Promise<void> {
  await i18n.changeLanguage(code);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
}

export default i18n;
