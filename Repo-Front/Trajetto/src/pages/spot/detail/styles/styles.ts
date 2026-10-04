import { Dimensions, StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

const { width } = Dimensions.get('window');

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.gray50 },
    container: { paddingBottom: 40 },

    mapCard: {
      marginHorizontal: 16, marginTop: 16, marginBottom: 16,
      borderRadius: 20, overflow: 'hidden',
    },
    map: { width: width - 32, height: 220 },

    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 16, marginBottom: 12 },
    badgePill: { backgroundColor: colors.gray200, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
    badgePillText: { fontSize: 13, color: colors.gray700, fontFamily: 'Inter-Medium' },

    name: { fontSize: 24, fontFamily: 'Inter-Bold', color: colors.gray900, marginHorizontal: 16, marginBottom: 4, lineHeight: 30 },
    subtitleLine: { fontSize: 13, color: colors.gray500, marginHorizontal: 16, marginBottom: 16 },

    actionsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 20 },
    actionBtn: {
      flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: colors.white, borderRadius: 14, paddingVertical: 16,
      shadowColor: colors.shadow, shadowOpacity: 0.15, shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 }, elevation: 3,
    },
    actionBtnText: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.gray900 },

    sectionTitle: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.gray500,
      textTransform: 'uppercase', letterSpacing: 0.8,
      marginHorizontal: 16, marginBottom: 8, marginTop: 4,
    },
    sectionHeaderRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      marginHorizontal: 16, marginBottom: 8, marginTop: 4,
    },
    openBadge: { backgroundColor: colors.gray200, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    openBadgeText: { fontSize: 12, fontFamily: 'Inter-Bold', color: colors.gray700 },

    card: {
      marginHorizontal: 16, marginBottom: 16,
      backgroundColor: colors.white, borderRadius: 16,
      borderWidth: 1, borderColor: colors.gray200,
      overflow: 'hidden',
    },

    hourRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
    hourRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray100 },
    hourPeriod: { fontSize: 13, color: colors.gray900, fontFamily: 'Inter-Medium', flex: 1 },
    hourValue: { fontSize: 13, color: colors.gray900, fontFamily: 'Inter-Medium' },
    hourTextToday: { fontFamily: 'Inter-Bold', color: colors.gray900 },
    hourTextClosed: { color: colors.gray400, fontFamily: 'Inter-Medium' },

    profilesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 16, marginBottom: 16 },

    ratingSummaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16 },
    ratingAverageRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    ratingAverage: { fontSize: 14, fontFamily: 'Inter-Bold', color: colors.gray900 },
    ratingCount: { fontSize: 12, color: colors.gray500, flex: 1 },
    ratingToggle: { fontSize: 12, color: colors.gray400 },
    ratingExpanded: { paddingHorizontal: 12, paddingBottom: 12 },

    headerWrapper: { paddingHorizontal: 24, backgroundColor: colors.primary },
    headerRow: { flexDirection: 'row', alignItems: 'center', position: 'relative', height: 56 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
    headerBackBtn: { paddingVertical: 4, paddingRight: 8, marginLeft: -12 },
    headerText: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.white },
  });
