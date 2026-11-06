import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    feedback: {
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
    },
    kav: { flex: 1, backgroundColor: colors.primaryDark },
    container: { flexGrow: 1 },
    card: {
      flex: 1,
      backgroundColor: colors.white,
      borderTopLeftRadius: 36,
      borderTopRightRadius: 36,
      padding: 28,
      gap: 12,
    },
    cardTitle: { fontSize: 28, letterSpacing: -0.5, fontFamily: 'Display-Bold', color: colors.text, marginBottom: 4 },
    formBlock: { marginTop: 0 },
    cardSub: { fontSize: 15, color: colors.textMuted, marginBottom: 24, lineHeight: 20 },
    registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    registerLink: { fontSize: 14, color: colors.primaryText, fontFamily: 'Jakarta-Bold' },
    headerWrapper: { paddingHorizontal: 24, paddingBottom: 30, overflow: 'hidden', backgroundColor: colors.primaryDark },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 70, marginBottom: 20, position: 'relative', height: 44 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
    headerBackBtn: { padding: 8, marginLeft: -12 },
    headerText: { fontSize: 26, letterSpacing: -0.5, fontFamily: 'Display-Bold', color: colors.onPrimary, marginLeft: -2 },
  });
