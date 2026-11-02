import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    rail: { width: 24, alignItems: 'center' },
    dash: { width: 2, height: 22, backgroundColor: colors.timelineTrackLight },
    pill: {
      flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 8,
      backgroundColor: colors.surfaceAlt, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 4,
    },
    pillLong: { backgroundColor: colors.warningBannerBg },
    text: { fontSize: 12, color: colors.textMuted },
    textLong: { color: colors.warningBannerText },
  });
