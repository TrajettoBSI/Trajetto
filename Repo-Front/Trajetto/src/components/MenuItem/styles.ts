import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    iconBadge: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.primarySurface,
      alignItems: 'center', justifyContent: 'center',
    },
    iconBadgeDanger: { backgroundColor: colors.errorSurface },
    label: { flex: 1, fontSize: 16, color: colors.text, fontFamily: 'Inter-Medium' },
    labelDanger: { color: colors.error },
    value: { fontSize: 14, color: colors.textSubtle, marginRight: 8 },
  });
