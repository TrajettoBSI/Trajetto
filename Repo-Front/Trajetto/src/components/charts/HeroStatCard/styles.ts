import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.primary, borderRadius: 16, padding: 18,
      marginHorizontal: 16, marginTop: 4,
      shadowColor: colors.shadow, shadowOpacity: 0.12, shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 }, elevation: 4,
    },
    label: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.onPrimaryFaint80,
      textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    number: { fontSize: 36, fontFamily: 'Inter-Bold', color: colors.white },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, flex: 1 },
    chip: { backgroundColor: colors.glassSurface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
    chipText: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.white },
  });
