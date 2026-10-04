import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.backgroundMuted },
    content: { paddingBottom: 32 },

    headerWrapper: { paddingHorizontal: 24, backgroundColor: colors.primary },
    headerRow: { flexDirection: 'row', alignItems: 'center', position: 'relative', height: 56 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
    headerBackBtn: { paddingVertical: 4, paddingRight: 8, marginLeft: -12 },
    headerText: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.white },

    section: { paddingHorizontal: 20, marginBottom: 8 },
    sectionTitle: {
      fontSize: 12,
      fontFamily: 'Inter-Bold',
      color: colors.textSubtle,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 8,
      marginLeft: 4,
    },
    menuCard: {
      backgroundColor: colors.white,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    separator: { height: 1, backgroundColor: colors.border, marginLeft: 66 },

    version: { textAlign: 'center', marginTop: 24, fontSize: 12, color: colors.textMutedLight },
  });
