import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.backgroundMuted },
    container: { flex: 1, paddingHorizontal: 16, backgroundColor: colors.backgroundMuted },

    headerWrapper: { paddingHorizontal: 24, backgroundColor: colors.primary },
    headerRow: { flexDirection: 'row', alignItems: 'center', position: 'relative', height: 56 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
    headerBackBtn: { paddingVertical: 4, paddingRight: 8, marginLeft: -12 },
    headerText: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.onPrimary },

    header: { paddingTop: 24, paddingBottom: 16 },
    headerTitle: { fontSize: 28, fontFamily: 'Inter-Bold', color: colors.gray900 },
    headerSubtitle: { fontSize: 14, color: colors.gray500, marginTop: 2 },

    feedback: { alignItems: 'center', marginTop: 48, gap: 12 },
    list: { paddingBottom: 32 },
  });
