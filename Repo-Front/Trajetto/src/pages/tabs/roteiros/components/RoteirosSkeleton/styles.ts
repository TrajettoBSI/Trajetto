import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    label: { width: 110, height: 11, marginBottom: 12 },
    card: {
      backgroundColor: colors.white, borderRadius: 20, padding: 20, marginBottom: 12,
      borderWidth: 1, borderColor: colors.border,
    },
    cover: { width: '100%', height: 170, borderRadius: 14, marginBottom: 16 },
    title: { width: '65%', height: 18, marginBottom: 10 },
    subtitle: { width: '40%', height: 12, marginBottom: 16 },
    progress: { width: '100%', height: 6, marginBottom: 20 },
    row: { flexDirection: 'row', gap: 14, marginBottom: 16 },
    dot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
    rowText: { flex: 1, gap: 8 },
    rowTitle: { width: '70%', height: 13 },
    rowSubtitle: { width: '90%', height: 10 },
  });
