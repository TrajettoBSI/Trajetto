import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.white, borderRadius: 20, padding: 14, marginBottom: 16,
      borderWidth: 1, borderColor: colors.borderSubtle,
    },
    tiles: { flexDirection: 'row', gap: 10 },
    tile: { flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: 14, padding: 12 },
    tileHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    tileLabel: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.textSubtle,
      letterSpacing: 0.6, textTransform: 'uppercase',
    },
    tileValue: { fontSize: 20, fontFamily: 'Inter-Bold', color: colors.gray900 },
    tileSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    badge: {
      flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
      backgroundColor: colors.successSurface, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4,
    },
    badgeText: { fontSize: 12, fontFamily: 'Inter-Bold', color: colors.successText },
    rainBanner: {
      flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10,
      backgroundColor: colors.primarySurface, borderRadius: 12, padding: 10,
    },
    rainText: { flex: 1, fontSize: 13, color: colors.primary, lineHeight: 18 },
  });
