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
      color: colors.onPrimary,
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
  });
