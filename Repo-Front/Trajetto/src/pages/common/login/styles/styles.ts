import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: colors.primary,
    },
    hero: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 56,
      gap: 6,
    },
    heroDecoration: { position: 'absolute' },
    intro: {
      fontSize: 13,
      color: colors.onPrimaryMuted,
      marginBottom: 4,
    },
    logoBadge: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.white,
      borderRadius: 20,
      width: 72,
      height: 72,
      marginBottom: 10,
      shadowColor: colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    brand: {
      fontSize: 30,
      fontFamily: 'FugazOne',
      color: colors.white,
    },
    card: {
      flex: 1,
      backgroundColor: colors.background,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 28,
      paddingBottom: 40,
    },
    cardTitle: {
      fontSize: 22,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 4,
    },
    cardSubtitle: {
      fontSize: 14,
      color: colors.textSubtle,
      marginBottom: 20,
    },
    feedback: {
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
    },
    inputIcon: { marginRight: 8 },
    forgotBtn: {
      alignSelf: 'flex-end',
      marginBottom: 24,
    },
    link: {
      fontSize: 14,
      color: colors.primary,
      fontFamily: 'Inter-Medium',
    },
    submitBtn: {
      borderRadius: 28,
    },
    registerRow: {
      marginTop: 28,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    registerText: {
      fontSize: 14,
      color: colors.textSubtle,
    },
    registerLink: {
      fontSize: 14,
      color: colors.primary,
      fontFamily: 'Inter-Bold',
    },
  });
