import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.white, borderRadius: 16, paddingVertical: 14,
      borderWidth: 1, borderColor: colors.border, marginBottom: 16,
      shadowColor: colors.shadow, shadowOpacity: 0.05, shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },

    header: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, marginBottom: 10,
    },
    title: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.gray500,
      textTransform: 'uppercase', letterSpacing: 0.8,
    },
    spinner: { marginLeft: 8 },
    headerRight: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
    badge: {
      backgroundColor: colors.primary, borderRadius: 10, minWidth: 20,
      paddingHorizontal: 6, paddingVertical: 1,
    },
    badgeText: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.onPrimary, textAlign: 'center',
    },
    clear: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.primary },

    chipRow: { paddingHorizontal: 16, gap: 8 },
    chip: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      maxWidth: 190, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9,
      backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    },
    chipActive: { backgroundColor: colors.primarySurface, borderColor: colors.primaryBorder },
    chipText: { fontSize: 13, color: colors.gray700, fontFamily: 'Inter-Medium', flexShrink: 1 },
    chipTextActive: { color: colors.primaryDark, fontFamily: 'Inter-Bold' },
  });
