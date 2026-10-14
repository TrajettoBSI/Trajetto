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
    headerExportText: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.onPrimary },
    headerActions: { flexDirection: 'row', gap: 8 },
    headerEditActive: { backgroundColor: colors.white, borderColor: colors.white },
    headerEditActiveText: { color: colors.primary },
    editHint: { fontSize: 13, color: colors.textMuted, marginBottom: 10, lineHeight: 18 },
    headerBarTitle: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.onPrimary },
    container: { flex: 1, backgroundColor: colors.backgroundMuted },
    content: { padding: 20 },

    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    loadingText: { marginTop: 16, fontSize: 15, color: colors.textMutedLight },

    sectionLabel: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.textSubtle,
      letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
    },
    timeline: { marginTop: 6 },
    daySelector: { marginBottom: 16, flexGrow: 0 },

    btnExport: {
      marginTop: 24,
    },
    btnAdd: {
      marginTop: 16,
    },
  });
