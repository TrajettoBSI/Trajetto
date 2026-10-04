import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useLanguageSwitcher } from '@/src/components/LanguageSwitcher/hooks/useLanguageSwitcher';
import { MenuItemProps } from '@/src/components/MenuItem/MenuItem';

export type MenuSection = {
  title?: string;
  items: MenuItemProps[];
};

export function usePerfil() {
  const { t } = useTranslation('profile');
  const { user, logout } = useAuth();
  const router = useRouter();
  const { open, setOpen, current, select } = useLanguageSwitcher();

  const menuSections: MenuSection[] = [
    {
      title: t('menu.accountSection'),
      items: [
        {
          icon: 'settings-outline',
          label: t('menu.settings'),
          onPress: () => router.push('/ProfileScreen'),
        },
        {
          icon: 'notifications-outline',
          label: t('menu.notifications'),
          onPress: () => {},
        },
        {
          icon: 'language-outline',
          label: t('menu.language'),
          value: current.label,
          onPress: () => setOpen(true),
        },
      ],
    },
    {
      title: t('menu.travelerSection'),
      items: [
        {
          icon: 'briefcase-outline',
          label: t('menu.retakeTest'),
          onPress: () => router.push('/TravelerTestScreen?source=profile'),
        },
        {
          icon: 'map-outline',
          label: t('menu.exploreDestinations'),
          onPress: () => router.push('/ExploreScreen'),
        },
      ],
    },
    {
      items: [
        {
          icon: 'log-out-outline',
          label: t('menu.logout'),
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
