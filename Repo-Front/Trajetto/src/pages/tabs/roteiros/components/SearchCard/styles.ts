import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    title: {
      fontSize: 15,
      fontFamily: 'Inter-Bold',
      color: colors.white,
      marginBottom: 12,
    },
    inputWrapper: {
      marginBottom: 0,
    },
    inputBox: {
      backgroundColor: colors.white,
      borderRadius: 14,
      shadowColor: colors.shadow,
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    input: {
      color: colors.textSubtle,
      paddingVertical: 9,
    },
    chipRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
    },
    chip: {
      backgroundColor: colors.white,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 6,
      shadowColor: colors.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    chipText: {
      fontSize: 12,
      fontFamily: 'Inter-Bold',
      color: colors.text,
    },
  });
