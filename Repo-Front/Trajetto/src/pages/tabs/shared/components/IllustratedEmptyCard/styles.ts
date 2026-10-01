import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.white,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18,
      alignItems: 'center',
    },
    cardsStack: {
      width: 280,
      height: 240,
      transform: [{ scale: 0.72 }],
      marginTop: -20,
      marginBottom: -20,
      position: 'relative',
    },
    title: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 6,
    },
    body: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 18,
      marginBottom: 14,
    },
    button: {
      paddingHorizontal: 24,
      paddingVertical: 10,
      minHeight: 44,
    },
    buttonText: {
      fontSize: 14,
    },
  });
