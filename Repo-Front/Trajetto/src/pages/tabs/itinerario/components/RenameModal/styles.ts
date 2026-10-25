import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    overlay: { flex: 1, backgroundColor: colors.overlay45, justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: colors.white,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      paddingHorizontal: 24, paddingBottom: 32, paddingTop: 8,
    },
    handle: {
      width: 40, height: 4, backgroundColor: colors.border,
      borderRadius: 2, alignSelf: 'center', marginBottom: 16,
    },
    title: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.gray900, marginBottom: 4 },
    subtitle: { fontSize: 13, color: colors.gray500, marginBottom: 16 },
    input: {
      borderWidth: 1.5, borderColor: colors.border, borderRadius: 14,
      padding: 14, fontSize: 15, color: colors.gray900, backgroundColor: colors.surfaceAlt,
    },
    feedback: { marginTop: 12 },
    actions: { flexDirection: 'row', gap: 12, marginTop: 20, alignItems: 'center' },
    cancelBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
    cancelBtnText: { fontSize: 15, fontFamily: 'Inter-Bold', color: colors.gray700 },
    saveBtn: { flex: 1.3, marginTop: 0 },
  });
