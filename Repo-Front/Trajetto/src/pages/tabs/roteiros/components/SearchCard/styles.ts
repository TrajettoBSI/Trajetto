import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      gap: 10,
    },
    title: {
      fontSize: 15,
      fontFamily: 'Jakarta-Bold',
      color: colors.onPrimary,
    },
    inputWrapper: {
      marginBottom: 0,
    },
    inputBox: {
      backgroundColor: colors.white,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      shadowColor: colors.shadow,
      shadowOpacity: 0.28,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    input: {
      color: colors.textSubtle,
      paddingVertical: 14,
    },
  });
