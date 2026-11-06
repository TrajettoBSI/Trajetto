import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundSoft },
    content: { padding: 24, paddingBottom: 40 },

    hero: {
      backgroundColor: colors.primaryDark,
      overflow: 'hidden',
      borderRadius: 30,
      padding: 32,
      alignItems: 'center',
      marginBottom: 20,
    },
    heroDecoration: { position: 'absolute' },
    heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
    heroLabel: { fontSize: 14, color: colors.onPrimarySubtle },
    emojiBadge: {
      width: 96, height: 96, borderRadius: 48,
      backgroundColor: colors.white,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    emoji: { fontSize: 48 },
    profileName: {
      fontSize: 26,
      fontFamily: 'Display-Bold',
      color: colors.onPrimary,
      textAlign: 'center',
      letterSpacing: 1,
    },

    card: {
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    cardTitle: {
      fontSize: 15,
      fontFamily: 'Jakarta-Bold',
      color: colors.primaryText,
      marginBottom: 12,
    },
    descricao: { fontSize: 15, color: colors.textFaint, lineHeight: 24 },

    destinoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    destinoDot: {
      width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary,
    },
    destinoText: { fontSize: 15, color: colors.textBody },

    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 28,
      padding: 16,
      marginTop: 4,
    },
    backButtonText: { color: colors.onPrimary, fontFamily: 'Jakarta-Bold', fontSize: 16 },

    tripCard: {
      borderRadius: 20, overflow: 'hidden', padding: 20, minHeight: 190, marginBottom: 12,
      backgroundColor: colors.primaryDark, justifyContent: 'flex-end',
    },
    tripImage: { ...StyleSheet.absoluteFill },
    tripKicker: {
      fontSize: 11, fontFamily: 'Jakarta-Bold', color: colors.onPrimaryMuted, letterSpacing: 1.5, textTransform: 'uppercase',
    },
    tripTitle: { fontSize: 24, fontFamily: 'Display-Bold', color: colors.onPrimary, marginTop: 4 },
    tripBody: { fontSize: 14, color: colors.onPrimaryMuted, marginTop: 4, lineHeight: 20 },
    tripCta: {
      flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 14,
      backgroundColor: colors.white, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10,
    },
    tripCtaText: { fontSize: 14, fontFamily: 'Jakarta-Bold', color: colors.primaryText },

    secondaryButton: { alignItems: 'center', padding: 14 },
    secondaryButtonText: { color: colors.textMuted, fontFamily: 'Jakarta-Bold', fontSize: 15 },

    errorText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: colors.gray600 },
  });
