import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.backgroundMuted },
    headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    headerBar: {
      backgroundColor: colors.primaryDark, paddingHorizontal: 20, paddingBottom: 14, overflow: 'hidden',
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    headerExportBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
      backgroundColor: colors.glassSurface, borderWidth: 1, borderColor: colors.glassBorder,
    },
    headerExportText: { fontSize: 13, fontFamily: 'Jakarta-Bold', color: colors.onPrimary },
    headerActions: { flexDirection: 'row', gap: 8 },
    headerEditActive: { backgroundColor: colors.white, borderColor: colors.white },
    headerEditActiveText: { color: colors.primaryText },
    editHint: { fontSize: 13, color: colors.textMuted, marginBottom: 10, lineHeight: 18 },
    headerShareBtn: { paddingHorizontal: 9 },
    headerBarTitle: { fontSize: 23, letterSpacing: -0.6, fontFamily: 'Display-Black', color: colors.onPrimary },
    container: { flex: 1, backgroundColor: colors.backgroundMuted },
    content: { padding: 20 },

    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    loadingText: { marginTop: 16, fontSize: 15, color: colors.textMutedLight },

    sectionLabel: {
      fontSize: 20, fontFamily: 'Display-Bold', color: colors.text, marginBottom: 6,
    },
    timeline: { marginTop: 6 },
    daySelector: { marginBottom: 16, flexGrow: 0 },

    btnExport: {
      marginTop: 24,
    },
    btnAdd: {
      marginTop: 16,
    },
    assistantFabWrap: { position: 'absolute', right: 20 },
    assistantFab: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: colors.primary, borderRadius: 28, paddingHorizontal: 18, paddingVertical: 14,
      shadowColor: colors.shadow, shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    assistantFabFill: { ...StyleSheet.absoluteFill, borderRadius: 28 },
    assistantFabText: { fontSize: 15, fontFamily: 'Jakarta-Bold', color: colors.onPrimary },
  });
