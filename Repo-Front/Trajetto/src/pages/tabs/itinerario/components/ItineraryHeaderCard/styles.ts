import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    headerCard: {
      backgroundColor: colors.primaryDark, borderRadius: 30, paddingHorizontal: 22, paddingTop: 96, paddingBottom: 20, marginBottom: 20,
      overflow: 'hidden',
    },
    image: { ...StyleSheet.absoluteFill, width: undefined, height: undefined },
    imageShade: { ...StyleSheet.absoluteFill },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    title: { flexShrink: 1, fontSize: 32, lineHeight: 35, letterSpacing: -0.8, fontFamily: 'Display-Black', color: colors.onPrimary },
    headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    headerLabel: {
      fontSize: 11, fontFamily: 'Jakarta-Bold', color: colors.onPrimaryFaint55,
      letterSpacing: 0.8, textTransform: 'uppercase',
    },
    activeBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: colors.onPrimaryFaint20, borderRadius: 20,
      paddingHorizontal: 10, paddingVertical: 4,
    },
    activeBadgeText: { fontSize: 11, fontFamily: 'Jakarta-Bold', color: colors.onPrimary },
    headerDates: { fontSize: 18, fontFamily: 'Jakarta-Bold', color: colors.onPrimary, marginBottom: 4 },
    headerHoursRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 14 },
    headerHours: { fontSize: 14, color: colors.onPrimaryFaint60 },
    statsRow: { flexDirection: 'row', gap: 32 },
    stat: { alignItems: 'flex-start' },
    statValue: { fontSize: 22, fontFamily: 'Display-Bold', color: colors.onPrimary, marginBottom: 2 },
    statLabel: { fontSize: 12, color: colors.onPrimaryFaint60 },
  });
