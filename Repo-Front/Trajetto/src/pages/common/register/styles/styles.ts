import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    feedback: {
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
    },
    flex: { flex: 1, backgroundColor: colors.backgroundMuted },
    scrollView: { flex: 1, backgroundColor: colors.white },
    headerWrapper: { paddingHorizontal: 24, paddingBottom: 40, overflow: 'hidden', backgroundColor: colors.primaryDark },
    content: { paddingBottom: 48 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, position: 'relative', height: 44 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
    headerBackBtn: { padding: 8, marginLeft: -12 },
    headerText: { fontSize: 26, letterSpacing: -0.5, fontFamily: 'Display-Bold', color: colors.onPrimary, marginLeft: -2 },
    card: {
      flex: 1,
      backgroundColor: colors.white,
      borderTopLeftRadius: 36,
      borderTopRightRadius: 36,
      marginTop: -32,
      padding: 28,
      paddingBottom: 40,
    },
    cardTitle: { fontSize: 28, letterSpacing: -0.5, fontFamily: 'Display-Bold', color: colors.text, marginBottom: 16 },
    row: { flexDirection: 'row', gap: 12 },
    field: { flex: 1, marginBottom: 16 },
    label: { fontSize: 13, fontFamily: 'Jakarta-Medium', color: colors.label, marginBottom: 6 },
    inputOk: { borderColor: colors.success },
    inputError: { borderColor: colors.error },
    errorText: { color: colors.error, fontSize: 11, marginTop: 4, marginLeft: 2 },
    dropdownTrigger: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11 },
    dropdownValue: { color: colors.text },
    dropdownPlaceholder: { color: colors.gray400 },
    dropdownText: { fontSize: 15, flex: 1 },
    inputIcon: { marginRight: 8 },
    button: { marginTop: 20, marginBottom: 16 },
    loginLink: { alignItems: 'center' },
    loginLinkText: { fontSize: 14, color: colors.gray500 },
    loginLinkBold: { color: colors.primaryText, fontFamily: 'Jakarta-Bold' },
  });
