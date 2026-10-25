import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    section: { marginBottom: 24 },
    title: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.text },
    subtitle: { fontSize: 12, color: colors.textSubtle, marginTop: 2, marginBottom: 12 },
    card: {
      backgroundColor: colors.white, borderRadius: 16,
      borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
    },
    image: { width: '100%', height: 180, backgroundColor: colors.backgroundMuted },
    body: { padding: 12 },
    name: { fontSize: 15, fontFamily: 'Inter-Bold', color: colors.text },
    cityRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
    city: { fontSize: 12, color: colors.textSubtle },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
    average: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.text },
    count: { fontSize: 12, color: colors.textSubtle },
    review: { fontSize: 12, fontStyle: 'italic', color: colors.text, marginTop: 8, lineHeight: 17 },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
    dotActive: { width: 18, backgroundColor: colors.primary },
    author: { fontSize: 11, color: colors.textSubtle, marginTop: 2 },
  });
