import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: colors.background,
    },
    hero: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 72,
      gap: 8,
      minHeight: 330,
      overflow: 'hidden',
      backgroundColor: colors.primaryDark,
    },
    heroDecoration: { position: 'absolute' },
    intro: {
      fontSize: 15,
      fontFamily: 'Jakarta-Medium',
      color: colors.onPrimaryFaint80,
    },
    logoBadge: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.glassSurface,
      borderWidth: 1,
      borderColor: colors.glassBorderStrong,
      borderRadius: 26,
      width: 84,
      height: 84,
      marginBottom: 12,
    },
    brand: {
      fontSize: 46,
      lineHeight: 50,
      fontFamily: 'Display-Black',
      letterSpacing: -1.5,
      color: colors.onPrimary,
    },
    card: {
      flex: 1,
      backgroundColor: colors.background,
      borderTopLeftRadius: 36,
      borderTopRightRadius: 36,
      marginTop: -36,
      padding: 28,
      paddingBottom: 40,
    },
    cardTitle: {
      fontSize: 30,
      letterSpacing: -0.6,
      fontFamily: 'Display-Bold',
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
      color: colors.primaryText,
      fontFamily: 'Jakarta-Medium',
    },
    submitBtn: {
      borderRadius: 30,
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
      color: colors.primaryText,
      fontFamily: 'Jakarta-Bold',
    },
  });
