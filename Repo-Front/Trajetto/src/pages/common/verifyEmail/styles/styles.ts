import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    feedback: {
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
    },
    scrollView: { flex: 1, backgroundColor: colors.white },
    scrollContent: { flexGrow: 1 },
    headerWrapper: { paddingHorizontal: 24, paddingBottom: 40, overflow: 'hidden', backgroundColor: colors.primaryDark },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 70, marginBottom: 20, position: 'relative', height: 44 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
    headerBackBtn: { padding: 8, marginLeft: -12 },
    headerText: { fontSize: 26, letterSpacing: -0.5, fontFamily: 'Display-Bold', color: colors.onPrimary, marginLeft: -2 },
    card: {
      flex: 1,
      backgroundColor: colors.white,
      borderTopLeftRadius: 36,
      borderTopRightRadius: 36,
      marginTop: -32,
      padding: 32,
    },
    title: { fontSize: 26, fontFamily: 'Display-Bold', marginBottom: 10, color: colors.text, textAlign: 'center', letterSpacing: -0.5 },
    subtitle: { fontSize: 15, color: colors.textMuted, marginBottom: 32, textAlign: 'center', lineHeight: 22 },
    emailHighlight: { color: colors.gray800, fontFamily: 'Jakarta-Medium' },
    resendBtn: { marginTop: 20, alignItems: 'center', padding: 8 },
    resendText: { fontSize: 14, fontFamily: 'Jakarta-Medium', color: colors.primaryText },
    resendTextDisabled: { color: colors.textMuted },
  });
