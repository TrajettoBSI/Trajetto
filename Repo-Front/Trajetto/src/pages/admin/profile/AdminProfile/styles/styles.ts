import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.backgroundMuted },
    content: { paddingBottom: 32 },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: colors.primary,
    },
    headerBackBtn: { padding: 4, marginRight: 8 },
    headerTitle: { fontSize: 20, fontFamily: 'Inter-Bold', color: colors.white },

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
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    separator: { height: 1, backgroundColor: colors.border, marginLeft: 66 },
  });
