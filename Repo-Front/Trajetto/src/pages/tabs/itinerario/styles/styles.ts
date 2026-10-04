import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.primary },
    headerBar: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingBottom: 12 },
    headerBarTitle: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.white },
    container: { flex: 1, backgroundColor: colors.backgroundMuted },
    content: { padding: 20, paddingBottom: 32 },

    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
    loadingText: { marginTop: 16, fontSize: 15, color: colors.textMutedLight },

    sectionLabel: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.textSubtle,
      letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
    },
    timeline: { marginTop: 6 },

    btnExport: {
      marginTop: 24,
    },
  });
