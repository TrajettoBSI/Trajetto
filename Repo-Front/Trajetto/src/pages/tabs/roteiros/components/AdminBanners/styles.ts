import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    adminBanner: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.warningBannerBg,
      paddingHorizontal: 20, paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: colors.warningBannerBorder,
    },
    bannerIcon: { fontSize: 18, marginRight: 10 },
    adminBannerText: { flex: 1, fontSize: 14, fontFamily: 'Inter-Medium', color: colors.warningBannerText },
    adminBannerArrow: { fontSize: 20, color: colors.warningBannerArrow },
  });
