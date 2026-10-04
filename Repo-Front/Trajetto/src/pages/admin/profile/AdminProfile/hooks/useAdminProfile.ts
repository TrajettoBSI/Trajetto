import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useLanguageSwitcher } from '@/src/components/LanguageSwitcher/hooks/useLanguageSwitcher';
import { MenuItemProps } from '@/src/components/MenuItem/MenuItem';

export type MenuSection = {
  title?: string;
  items: MenuItemProps[];
};

export function useAdminProfile() {
  const { t } = useTranslation('admin');
  const { user, logout } = useAuth();
  const router = useRouter();
  const { open, setOpen, current, select } = useLanguageSwitcher();

  const menuSections: MenuSection[] = [
    {
      title: t('profile.accountSection'),
      items: [
        {
          icon: 'notifications-outline',
          label: t('profile.notifications'),
          onPress: () => {},
        },
        {
          icon: 'language-outline',
          label: t('profile.language'),
          value: current.label,
          onPress: () => setOpen(true),
        },
      ],
    },
    {
      items: [
        {
          icon: 'log-out-outline',
          label: t('profile.logout'),
          onPress: logout,
          danger: true,
        },
      ],
    },
  ];

  return {
    t,
    user,
    router,
    menuSections,
    languagePicker: { open, setOpen, current, select },
  };
}
