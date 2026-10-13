import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    row: { flexDirection: 'row' },
    rail: { alignItems: 'center', width: 24, marginRight: 14 },
    railLine: { flex: 1, width: 2, backgroundColor: colors.timelineTrackLight },
    card: {
      flex: 1,
      marginBottom: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border,
      backgroundColor: colors.white,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
    icon: { fontSize: 22 },
    headerText: { flex: 1 },
    title: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.gray900 },
    subtitle: { fontSize: 12, color: colors.gray500, marginTop: 1 },
    loading: { marginVertical: 8 },
    retry: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
    retryText: { flex: 1, fontSize: 13, color: colors.gray500 },
    retryAction: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.primary },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    optionName: { flex: 1, fontSize: 14, color: colors.gray800 },
    optionDistance: { fontSize: 12, color: colors.gray500 },
  });
