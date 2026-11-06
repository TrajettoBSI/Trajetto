import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      marginTop: 8,
      marginBottom: 16,
      padding: 16,
      gap: 12,
      borderRadius: 16,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    textBox: { flex: 1 },
    title: { fontSize: 16, fontFamily: 'Jakarta-Bold', color: colors.gray900 },
    subtitle: { fontSize: 13, color: colors.gray600, marginTop: 2 },
    input: {
      minHeight: 64,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 12,
      fontSize: 14,
      color: colors.gray900,
      backgroundColor: colors.surfaceAlt,
      textAlignVertical: 'top',
    },
    saveBtn: {
      alignSelf: 'flex-end',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    saveBtnText: { fontSize: 14, fontFamily: 'Jakarta-Bold', color: colors.onPrimary },
    feedback: { marginTop: 0 },
  });
