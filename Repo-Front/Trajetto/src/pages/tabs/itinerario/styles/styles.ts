import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.primary },
    headerBar: {
      backgroundColor: colors.primary, paddingHorizontal: 24, paddingBottom: 12,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    headerExportBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
      backgroundColor: colors.glassSurface, borderWidth: 1, borderColor: colors.glassBorder,
    },
    headerExportText: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.white },
    headerBarTitle: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.white },
    container: { flex: 1, backgroundColor: colors.backgroundMuted },
    content: { padding: 20 },

    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    loadingText: { marginTop: 16, fontSize: 15, color: colors.textMutedLight },

    sectionLabel: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.textSubtle,
      letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
    },
    timeline: { marginTop: 6 },
    freeDay: {
      alignItems: 'center', padding: 24, marginTop: 6, borderRadius: 16,
      backgroundColor: colors.white, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border,
    },
    freeDayIcon: { fontSize: 32, marginBottom: 8 },
    freeDayTitle: { fontSize: 16, fontFamily: 'Inter-Bold', color: colors.gray900, marginBottom: 4 },
    freeDayText: { fontSize: 13, color: colors.gray500, textAlign: 'center', lineHeight: 19 },
    daySelector: { marginBottom: 16, flexGrow: 0 },

    btnExport: {
      marginTop: 24,
    },
  });
