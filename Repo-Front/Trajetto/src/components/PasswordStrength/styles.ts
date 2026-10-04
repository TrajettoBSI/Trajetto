import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    container: { marginTop: 8, marginBottom: 16 },
    strengthRow: { flexDirection: 'row', gap: 6 },
    strengthBar: { flex: 1, height: 4, borderRadius: 2 },
    strengthOk: { backgroundColor: colors.success },
    strengthWeak: { backgroundColor: colors.trackMuted },
    missingText: { fontSize: 12, color: colors.gray400, marginTop: 6 },
  });
