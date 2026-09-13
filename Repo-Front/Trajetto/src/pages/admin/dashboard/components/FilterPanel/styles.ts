import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 16,
      shadowColor: colors.shadow, shadowOpacity: 0.05, shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },

    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
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

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    field: {
      width: '47%', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
      backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    },
    fieldActive: { backgroundColor: colors.primarySurface, borderColor: colors.primaryBorder },
    fieldLabel: { fontSize: 11, color: colors.gray500, fontFamily: 'Inter-Medium', marginBottom: 2 },
    fieldValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    fieldValue: { flex: 1, fontSize: 14, color: colors.gray700, fontFamily: 'Inter-Medium' },
    fieldValueActive: { color: colors.primaryDark, fontFamily: 'Inter-Bold' },
    chevron: { fontSize: 12, color: colors.gray400 },

    note: { fontSize: 11, color: colors.gray400, marginTop: 10 },
  });
