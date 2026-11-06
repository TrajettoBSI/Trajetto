import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    infoRow: {
      paddingHorizontal: 16,
      paddingVertical: 13,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray100,
    },
    infoRowLast: { borderBottomWidth: 0 },
    infoText: { fontSize: 14, color: colors.gray900, fontFamily: 'Jakarta-Medium' },
    infoPrefix: { color: colors.gray500 },
    infoLink: { color: colors.primaryText, textDecorationLine: 'underline' },
  });
