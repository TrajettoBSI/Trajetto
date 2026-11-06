import { Dimensions, StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

const { width } = Dimensions.get('window');

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.gray50 },
    container: { paddingBottom: 40 },

    mapCard: {
      marginHorizontal: 16, marginTop: 16, marginBottom: 16,
      borderRadius: 26, overflow: 'hidden',
    },
    map: { width: width - 32, height: 220 },
    photo: { marginHorizontal: 16, marginTop: 16, height: 240, borderRadius: 26, backgroundColor: colors.gray200 },

    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 16, marginBottom: 12 },
    badgePill: { backgroundColor: colors.primarySurface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
    badgePillText: { fontSize: 13, color: colors.primaryText, fontFamily: 'Jakarta-Medium' },
    bookingBanner: {
      flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginBottom: 16, padding: 14,
      borderRadius: 14, backgroundColor: colors.warningBannerBg, borderWidth: 1, borderColor: colors.warningBannerBorder,
    },
    bookingTextBox: { flex: 1 },
    bookingTitle: { fontSize: 14, fontFamily: 'Jakarta-Bold', color: colors.warningBannerText },
    bookingText: { fontSize: 13, color: colors.warningBannerText, marginTop: 2 },

    name: { fontSize: 30, letterSpacing: -0.6, fontFamily: 'Display-Bold', color: colors.gray900, marginHorizontal: 16, marginBottom: 4, lineHeight: 30 },
    subtitleLine: { fontSize: 13, color: colors.gray500, marginHorizontal: 16, marginBottom: 16 },

    actionsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 20 },
    actionBtn: {
      flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8,
      backgroundColor: colors.white, borderRadius: 20, paddingVertical: 16,
      borderWidth: 1, borderColor: colors.borderSubtle,
      shadowColor: colors.shadow, shadowOpacity: 0.06, shadowRadius: 12,
      shadowOffset: { width: 0, height: 5 }, elevation: 2,
    },
    actionBtnText: { fontSize: 13, fontFamily: 'Jakarta-Bold', color: colors.gray900 },

    sectionTitle: {
      fontSize: 19, fontFamily: 'Display-Bold', color: colors.text,
      marginHorizontal: 16, marginBottom: 8, marginTop: 4,
    },
    sectionTitleInRow: { marginHorizontal: 0, marginBottom: 0, marginTop: 0 },
    sectionHeaderRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      marginHorizontal: 16, marginBottom: 8, marginTop: 4,
    },
    openBadge: { backgroundColor: colors.gray200, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    openBadgeText: { fontSize: 12, fontFamily: 'Jakarta-Bold', color: colors.gray700 },

    card: {
      marginHorizontal: 16, marginBottom: 16,
      backgroundColor: colors.white, borderRadius: 22,
      borderWidth: 1, borderColor: colors.borderSubtle,
      overflow: 'hidden',
    },

    hourRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
    hourRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray100 },
    hourPeriod: { fontSize: 13, color: colors.gray900, fontFamily: 'Jakarta-Medium', flex: 1 },
    hourValue: { fontSize: 13, color: colors.gray900, fontFamily: 'Jakarta-Medium' },
    hourTextToday: { fontFamily: 'Jakarta-Bold', color: colors.gray900 },
    hourTextClosed: { color: colors.gray400, fontFamily: 'Jakarta-Medium' },

    profilesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 16, marginBottom: 16 },

    ratingSummaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16 },
    ratingAverageRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    ratingAverage: { fontSize: 14, fontFamily: 'Jakarta-Bold', color: colors.gray900 },
    ratingCount: { fontSize: 12, color: colors.gray500, flex: 1 },
    ratingToggle: { fontSize: 12, color: colors.gray400 },
    ratingExpanded: { paddingHorizontal: 12, paddingBottom: 12 },

    headerWrapper: { paddingHorizontal: 24, overflow: 'hidden', backgroundColor: colors.primaryDark },
    headerRow: { flexDirection: 'row', alignItems: 'center', position: 'relative', height: 56 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
    headerBackBtn: { paddingVertical: 4, paddingRight: 8, marginLeft: -12 },
    headerText: { fontSize: 18, fontFamily: 'Jakarta-Bold', color: colors.onPrimary },
    headerFavoriteBtn: { marginLeft: 'auto', padding: 6, marginRight: -6 },
  });
