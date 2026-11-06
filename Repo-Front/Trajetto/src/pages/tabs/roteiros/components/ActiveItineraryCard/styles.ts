import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    itineraryCard: {
      backgroundColor: colors.white, borderRadius: 30, padding: 12, paddingBottom: 18, marginBottom: 12,
      borderWidth: 1, borderColor: colors.borderSubtle,
      shadowColor: colors.shadow, shadowOpacity: 0.07, shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 }, elevation: 3,
    },
    cardSelected: {
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: colors.selectedSurface,
    },
    checkboxRow: { marginBottom: 10 },
    hero: {
      height: 230, borderRadius: 22, marginBottom: 18, overflow: 'hidden',
      justifyContent: 'space-between', padding: 14, backgroundColor: colors.primaryDark,
    },
    heroImage: { ...StyleSheet.absoluteFill },
    heroScrim: { ...StyleSheet.absoluteFill },
    heroTop: { flexDirection: 'row' },
    heroBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 7,
      backgroundColor: colors.overlay, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
    },
    heroBadgeText: { fontSize: 12, fontFamily: 'Jakarta-Bold', color: colors.onPrimary },
    heroBottom: { gap: 4 },
    heroTitle: { fontSize: 30, lineHeight: 33, letterSpacing: -0.7, fontFamily: 'Display-Black', color: colors.onPrimary },
    heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    heroDates: { fontSize: 13, fontFamily: 'Jakarta-Medium', color: colors.onPrimary },

    itineraryCardHeader: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 12,
    },
    activeBadge: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.activeBadgeSurface, borderRadius: 20,
      paddingHorizontal: 10, paddingVertical: 4, gap: 6,
    },
    activeBadgeText: { fontSize: 12, fontFamily: 'Jakarta-Bold', color: colors.successText },
    itineraryDates: { fontSize: 12, color: colors.textSubtle, fontFamily: 'Jakarta-Medium' },
    titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 5 },
    locationIcon: { marginBottom: 5 },
    itineraryCardTitle: { fontSize: 18, fontFamily: 'Jakarta-Bold', color: colors.text, flex: 1 },
    chevron: { fontSize: 22, color: colors.borderMuted, marginLeft: 8 },
    itineraryCardSub: { fontSize: 13, color: colors.textSubtle },

    progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginHorizontal: 8 },
    progressPercentBlock: { alignItems: 'center' },
    progressPercentText: { fontSize: 18, fontFamily: 'Jakarta-Bold', color: colors.text },
    progressDoneText: { fontSize: 11, color: colors.textSubtle },
    progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.divider, marginBottom: 20, marginHorizontal: 8, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3, overflow: 'hidden' },
    progressGradient: { flex: 1 },

    dayLabel: { fontSize: 11, fontFamily: 'Jakarta-Bold', color: colors.textSubtle, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8, marginHorizontal: 8 },
    timeline: { gap: 0, marginHorizontal: 8 },
    timelineItem: { flexDirection: 'row', minHeight: 56 },
    timelineLeft: { alignItems: 'center', width: 24, marginRight: 12 },
    timelineLine: { flex: 1, width: 2, backgroundColor: colors.timelineTrack, marginTop: 4 },
    timelineContent: { flex: 1, paddingBottom: 16 },
    timelineContentPast: { opacity: 0.5 },
    timelineTime: { fontSize: 13, fontFamily: 'Jakarta-Bold', marginBottom: 2 },
    timelineName: { fontSize: 15, fontFamily: 'Jakarta-Medium', color: colors.text, marginBottom: 2 },
    timelineAddress: { fontSize: 12, color: colors.textSubtle },
    divider: { height: 1, backgroundColor: colors.dividerSoft, margin: 8, marginVertical: 12 },

    buttonRow: { flexDirection: 'row', gap: 12, marginHorizontal: 8 },
    openBtn: {
      flex: 1.6, alignItems: 'center', justifyContent: 'center',
      borderRadius: 16, paddingVertical: 13, backgroundColor: colors.primary, minHeight: 48,
    },
    openBtnText: { fontSize: 15, fontFamily: 'Jakarta-Bold', color: colors.onPrimary },
    deleteBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      borderWidth: 1.5, borderColor: colors.dangerBorder, borderRadius: 16,
      paddingVertical: 13, backgroundColor: colors.dangerSurface, minHeight: 48,
    },
    deleteBtnText: { fontSize: 15, fontFamily: 'Jakarta-Bold', color: colors.error },
  });
