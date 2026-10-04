import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 14,
    },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray100 },
    label: { flex: 1, fontSize: 15, color: colors.text, marginRight: 8 },
    valueGroup: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
    value: { fontSize: 16, fontFamily: 'Inter-Bold', color: colors.text },
    subValue: { fontSize: 13, color: colors.textSubtle },
  });
