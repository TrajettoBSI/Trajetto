import { StyleSheet } from 'react-native';
import { AppColors, adminAccent } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.backgroundMuted },

    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    },
    headerTitle: { fontSize: 24, fontFamily: 'Inter-Bold', color: colors.text },
    headerSub: { fontSize: 14, color: colors.textSubtle, marginTop: 2 },
    avatarBtn: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: colors.avatarSurface,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: colors.shadow, shadowOpacity: 0.1, shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },

    chip: { backgroundColor: colors.gray100, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
    chipText: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.text },

    tabBar: {
      flexDirection: 'row', backgroundColor: colors.gray100,
      marginHorizontal: 16, marginTop: 16, borderRadius: 28,
      padding: 4, gap: 4,
    },
    tabBtn: {
      flex: 1, flexDirection: 'row', gap: 6, paddingVertical: 14, borderRadius: 24,
      alignItems: 'center', justifyContent: 'center',
    },
    tabBtnActive: {
      backgroundColor: colors.white,
      shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 }, elevation: 1,
    },
    tabText: { fontSize: 14, fontFamily: 'Inter-Medium', color: colors.gray500 },
    tabTextActive: { color: colors.text, fontFamily: 'Inter-Bold' },

    container: { padding: 16, paddingBottom: 40 },

    stateBox: { minHeight: 280, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },

    metricsCard: {
      backgroundColor: colors.white, borderRadius: 16, paddingHorizontal: 16,
      borderWidth: 1, borderColor: colors.border,
      shadowColor: colors.shadow, shadowOpacity: 0.05, shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: 16,
    },

    verifiedBarTrack: { height: 10, backgroundColor: colors.gray100, borderRadius: 5, overflow: 'hidden', marginBottom: 14 },
    verifiedBarFill: { height: 10, backgroundColor: adminAccent.green, borderRadius: 5 },
    verifiedLegend: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    verifiedPendingText: { fontSize: 12, color: colors.textSubtle },

    twoColRow: { flexDirection: 'row', gap: 12 },
    twoCol: { flex: 1 },
    twoColTitle: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.gray500,
      textTransform: 'uppercase', letterSpacing: 0.8,
      marginBottom: 8, marginLeft: 2,
    },

    featuredRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    featuredRank: {
      width: 32, height: 32, borderRadius: 16,
      borderWidth: 1.5, borderColor: colors.border,
      alignItems: 'center', justifyContent: 'center',
    },
    featuredRankText: { fontSize: 14, fontFamily: 'Inter-Bold', color: colors.text },
    featuredInfo: { flex: 1 },
    featuredName: { fontSize: 15, fontFamily: 'Inter-Bold', color: colors.text, marginBottom: 2 },
    featuredSub: { fontSize: 13, color: colors.textSubtle },

    userListBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: colors.white, borderRadius: 16, padding: 18,
      borderWidth: 1, borderColor: colors.border,
      shadowColor: colors.shadow, shadowOpacity: 0.05, shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 }, elevation: 2,
      marginBottom: 8,
    },
    userListBtnText: { flex: 1, fontSize: 15, fontFamily: 'Inter-Bold', color: colors.text },
    userListBtnArrow: { fontSize: 22, color: colors.gray500 },
  });
