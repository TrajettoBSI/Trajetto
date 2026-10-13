import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    row: { gap: 8, paddingVertical: 4 },
    chip: {
      backgroundColor: colors.white,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      minWidth: 76,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipTitle: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.gray900 },
    chipTitleActive: { color: colors.white },
    chipDate: { fontSize: 11, color: colors.gray500, marginTop: 2 },
    chipDateActive: { color: colors.onPrimaryMuted },
  });
