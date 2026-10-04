import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    headerCard: {
      backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 18, marginBottom: 24,
    },
    headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    headerLabel: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.onPrimaryFaint55,
      letterSpacing: 0.8, textTransform: 'uppercase',
    },
    activeBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: colors.onPrimaryFaint20, borderRadius: 20,
      paddingHorizontal: 10, paddingVertical: 4,
    },
    activeBadgeText: { fontSize: 11, fontFamily: 'Inter-Bold', color: colors.white },
    headerDates: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.white, marginBottom: 4 },
    headerHoursRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 14 },
    headerHours: { fontSize: 14, color: colors.onPrimaryFaint60 },
    stat: { alignItems: 'flex-start' },
    statValue: { fontSize: 22, fontFamily: 'Inter-Bold', color: colors.white, marginBottom: 2 },
    statLabel: { fontSize: 12, color: colors.onPrimaryFaint60 },
    activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.activeDotGreen },
  });
