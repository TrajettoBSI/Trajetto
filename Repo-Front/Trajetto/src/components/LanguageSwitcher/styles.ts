import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: colors.white,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 40,
    },
    handle: {
      width: 40, height: 4, backgroundColor: colors.border,
      borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16,
    },
    title: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.gray900, marginBottom: 16 },
    option: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.gray100,
    },
    optionText: { fontSize: 16, color: colors.text },
    optionTextActive: { color: colors.primary, fontFamily: 'Inter-Bold' },
    checkmark: { color: colors.primary, fontSize: 16, fontFamily: 'Inter-Bold' },
  });
