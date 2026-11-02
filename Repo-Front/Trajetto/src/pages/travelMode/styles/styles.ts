import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.backgroundMuted },
    header: {
      backgroundColor: colors.primary, paddingHorizontal: 16, paddingBottom: 16,
      flexDirection: 'row', alignItems: 'center', gap: 10,
    },
    backBtn: {
      width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.glassSurface,
    },
    headerText: { flex: 1 },
    headerTitle: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.onPrimary },
    headerSub: { fontSize: 13, color: colors.onPrimaryMuted, marginTop: 2, textTransform: 'capitalize' },
    weatherChip: {
      flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.glassSurface,
      borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6,
    },
    weatherText: { fontSize: 14, fontFamily: 'Inter-Bold', color: colors.onPrimary },
    content: { padding: 20 },

    simCard: {
      backgroundColor: colors.primarySurface, borderRadius: 16, padding: 14, marginBottom: 16,
      borderWidth: 1, borderColor: colors.primaryBorder,
    },
    simHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    simTitle: { flex: 1, fontSize: 13, color: colors.primary, fontFamily: 'Inter-Bold' },
    simClock: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
    simControls: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
    simBtn: {
      backgroundColor: colors.white, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8,
      alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.primaryBorder,
    },
    simBtnPrimary: { backgroundColor: colors.primary, borderColor: colors.primary, flexGrow: 1 },
    simBtnText: { fontSize: 12, fontFamily: 'Inter-Bold', color: colors.primary },
    simBtnTextPrimary: { color: colors.onPrimary },

    progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    progressText: { fontSize: 13, color: colors.textMuted },
    progressPercent: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.primary },
    progressTrack: { height: 8, borderRadius: 4, backgroundColor: colors.trackMuted, overflow: 'hidden', marginBottom: 16 },
    progressFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },

    hero: { height: 230, borderRadius: 22, overflow: 'hidden', backgroundColor: colors.primaryDark },
    heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
    heroShade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.overlay45 },
    heroBody: { flex: 1, justifyContent: 'flex-end', padding: 18 },
    statusPill: {
      flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
      backgroundColor: colors.glassTag, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 8,
    },
    statusPillNow: { backgroundColor: colors.successStrong },
    statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.onPrimary },
    statusDotNow: { backgroundColor: colors.white },
    statusText: { fontSize: 12, fontFamily: 'Inter-Bold', color: colors.onPrimary },
    heroName: { fontSize: 24, fontFamily: 'Inter-Bold', color: colors.onPrimary },
    heroMeta: { fontSize: 14, color: colors.onPrimaryFaint80, marginTop: 4 },

    doneCard: {
      backgroundColor: colors.white, borderRadius: 22, padding: 28, alignItems: 'center', gap: 8,
    },
    doneTitle: { fontSize: 20, fontFamily: 'Inter-Bold', color: colors.gray900 },
    doneText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },

    distanceRow: {
      flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14,
      backgroundColor: colors.white, borderRadius: 14, padding: 12,
    },
    distanceText: { flex: 1, fontSize: 14, color: colors.gray800 },
    noteBox: {
      flexDirection: 'row', gap: 8, marginTop: 10, backgroundColor: colors.hintSurface,
      borderRadius: 12, padding: 12,
    },
    noteText: { flex: 1, fontSize: 13, color: colors.gray700, lineHeight: 18 },
    actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
    actionBtn: {
      flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 12,
      borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.primaryBorder,
    },
    actionPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
    actionText: { fontSize: 12, fontFamily: 'Inter-Bold', color: colors.primary },
    actionTextPrimary: { color: colors.onPrimary },

    sectionLabel: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.textSubtle,
      letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 24, marginBottom: 8,
    },
    stopRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 12,
      backgroundColor: colors.white, borderRadius: 12, marginBottom: 6,
    },
    stopRowFocus: { borderWidth: 1.5, borderColor: colors.primary },
    stopTime: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.gray700, width: 48 },
    stopName: { flex: 1, fontSize: 14, color: colors.gray900 },
    stopDone: { color: colors.textFaint, textDecorationLine: 'line-through' },
  });
