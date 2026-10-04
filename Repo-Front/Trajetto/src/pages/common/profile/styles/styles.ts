import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.backgroundMuted },
    feedback: {
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
    },
    content: { flexGrow: 1 },
    sectionTitle: { fontSize: 11, fontFamily: 'Inter-Bold', color: colors.chipMutedText, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 15 },
    card: {
      flex: 1,
      backgroundColor: colors.white,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 24,
      paddingBottom: 40,
      shadowColor: colors.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    row: { flexDirection: 'row', gap: 12 },
    field: { flex: 1, marginBottom: 16 },
    label: { fontSize: 12, fontFamily: 'Inter-Bold', color: colors.chipMutedText, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
    inputError: { borderColor: colors.error },
    errorText: { color: colors.error, fontSize: 11, marginTop: 4, marginLeft: 2 },
    dropdownTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11 },
    dropdownValue: { fontSize: 15, color: colors.text, flex: 1 },
    dropdownPlaceholder: { fontSize: 15, color: colors.gray400, flex: 1 },
    dropdownChevron: { fontSize: 10, color: colors.gray400, marginLeft: 8 },
    saveButton: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5, marginTop: 15, marginBottom: 16, minHeight: 50, justifyContent: 'center' },
    saveButtonText: { color: colors.white, fontFamily: 'Inter-Bold', fontSize: 16 },
    headerWrapper: { paddingHorizontal: 24, backgroundColor: colors.primary },
    headerRow: { flexDirection: 'row', alignItems: 'center', position: 'relative', height: 56 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
    headerBackBtn: { paddingVertical: 4, paddingRight: 8, marginLeft: -12 },
    headerText: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.white },
  });
