import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type AdminBannersProps = {
  onPressUsers: () => void;
  onPressDashboard: () => void;
};

export default function AdminBanners({ onPressUsers, onPressDashboard }: AdminBannersProps) {
  const { t } = useTranslation('roteiros');
  const s = styles(useColors());
  return (
    <>
      <TouchableOpacity style={s.adminBanner} onPress={onPressUsers} activeOpacity={0.8}>
        <Text style={s.bannerIcon}>🛡️</Text>
        <Text style={s.adminBannerText}>{t('adminBanners.adminPanel')}</Text>
        <Text style={s.adminBannerArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.dashboardBanner} onPress={onPressDashboard} activeOpacity={0.8}>
        <Text style={s.bannerIcon}>📊</Text>
        <Text style={s.dashboardBannerText}>{t('adminBanners.dashboard')}</Text>
        <Text style={s.dashboardBannerArrow}>›</Text>
      </TouchableOpacity>
    </>
  );
}
