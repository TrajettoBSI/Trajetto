import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    panel: {
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 30,
      backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      paddingHorizontal: 20, paddingTop: 16,
      shadowColor: colors.shadow, shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: -3 }, elevation: 12,
    },
    headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
    headerText: { flex: 1 },
    legLabel: { fontSize: 11, fontFamily: 'Inter-Bold', color: colors.textSubtle, letterSpacing: 0.8, textTransform: 'uppercase' },
    destName: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.text, marginTop: 2 },
    fromText: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    closeBtn: { padding: 4, marginLeft: 8 },

    loadingBox: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 18 },
    loadingText: { fontSize: 14, color: colors.textMuted },
    feedback: { marginTop: 12 },

    remainingRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 12 },
    remainingBig: { fontSize: 26, fontFamily: 'Inter-Bold', color: colors.primary },
    remainingSmall: { fontSize: 14, color: colors.textMuted, flexShrink: 1 },

    modesRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    modeCard: {
      flex: 1, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderRadius: 14,
      borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white,
    },
    modeCardSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    recommended: {
      position: 'absolute', top: -9, fontSize: 10, fontFamily: 'Inter-Bold', color: colors.onPrimary,
      backgroundColor: colors.success, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1, overflow: 'hidden',
    },
    modeName: { fontSize: 12, fontFamily: 'Inter-Medium', color: colors.text, marginTop: 4 },
    modeTime: { fontSize: 14, fontFamily: 'Inter-Bold', color: colors.text, marginTop: 2 },
    modeDistance: { fontSize: 11, color: colors.textMuted },
    modeTextSelected: { color: colors.onPrimary },

    reason: { fontSize: 13, color: colors.textMuted, marginTop: 10 },
    steps: { maxHeight: 130, marginTop: 10 },
    stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.divider },
    stepNumber: { width: 20, fontSize: 12, fontFamily: 'Inter-Bold', color: colors.primary, textAlign: 'center' },
    stepText: { flex: 1, fontSize: 13, color: colors.text },
    stepDistance: { fontSize: 12, color: colors.textMuted },
    estimateNote: { fontSize: 13, color: colors.textMuted, marginTop: 10, lineHeight: 18 },

    actions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
    secondaryBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 14,
      borderRadius: 14, borderWidth: 1.5, borderColor: colors.primary,
    },
    secondaryText: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.primary },
    primaryBtn: { flex: 1 },

    finishedEmoji: { fontSize: 36, textAlign: 'center' },
    finishedTitle: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.text, textAlign: 'center', marginTop: 6 },
    finishedText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 4, marginBottom: 14 },
  });
