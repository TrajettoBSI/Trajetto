import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    timelineRow: { flexDirection: 'row' },
    rail: { alignItems: 'center', width: 24, marginRight: 14 },
    dot: { width: 14, height: 14, borderRadius: 7, marginTop: 18 },
    dotPast: { backgroundColor: colors.timelineDotPast, opacity: 0.6 },
    line: { flex: 1, width: 2, backgroundColor: colors.timelineTrackLight, marginTop: 4 },
    content: { flex: 1 },
    editBar: { flexDirection: 'row', gap: 8, marginTop: -4, marginBottom: 16 },
    editBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8,
      borderRadius: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border,
    },
    removeBtn: { marginLeft: 'auto', borderColor: colors.dangerBorder, backgroundColor: colors.dangerSurface },
    removeText: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.errorText },
  });
