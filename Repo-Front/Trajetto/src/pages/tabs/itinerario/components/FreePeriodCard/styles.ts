import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    row: { flexDirection: 'row' },
    rail: { alignItems: 'center', width: 24, marginRight: 14 },
    railLine: { flex: 1, width: 2, backgroundColor: colors.timelineTrackLight },
    card: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
      borderRadius: 14,
      backgroundColor: colors.successSurface,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    icon: { fontSize: 24 },
    textBox: { flex: 1 },
    title: { fontSize: 14, fontFamily: 'Inter-Bold', color: colors.gray900 },
    text: { fontSize: 12, color: colors.gray600, marginTop: 2, lineHeight: 17 },
  });
