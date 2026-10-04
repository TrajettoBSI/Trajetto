import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    donutLegend: { gap: 14 },
    donutRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    donutBullet: { fontSize: 16, color: colors.text, flexShrink: 0 },
    donutLabel: { fontSize: 13, fontFamily: 'Inter-Medium', color: colors.text, width: 90 },
    donutLabelBold: { fontFamily: 'Inter-Bold' },
    donutBarTrack: { flex: 1, height: 6, backgroundColor: colors.gray100, borderRadius: 3, overflow: 'hidden' },
    donutBarFill: { height: 6, borderRadius: 3 },
    donutPct: { fontSize: 12, color: colors.textSubtle, width: 36, textAlign: 'right' },
  });
