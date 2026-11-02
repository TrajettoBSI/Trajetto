import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    banner: {
      flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14,
      backgroundColor: colors.warningBannerBg, borderColor: colors.warningBannerBorder, borderWidth: 1,
      borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    },
    text: { flex: 1, fontSize: 13, color: colors.warningBannerText, lineHeight: 18 },
  });
