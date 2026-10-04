import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.white },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.white,
      paddingTop: 16,
      paddingBottom: 8,
      paddingHorizontal: 24,
    },
    headerTitleIos: { fontSize: 16, fontFamily: 'Inter-Bold', color: colors.text },
    headerTitleAndroid: { fontSize: 24, fontFamily: 'Inter-Bold', color: colors.text },
    headerTitle: { fontFamily: 'Inter-Bold', color: colors.text },
    headerGreeting: { color: colors.textSubtle },
    cancelSelectText: { fontSize: 15, color: colors.primary, fontFamily: 'Inter-Medium' },
    selectAllText: { fontSize: 15, color: colors.primary, fontFamily: 'Inter-Medium' },
    avatarBtn: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: colors.avatarSurface,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: colors.shadow, shadowOpacity: 0.1, shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },

    content: { padding: 20, paddingTop: 4, paddingBottom: 120, backgroundColor: colors.white },

    centerState: { alignItems: 'center', paddingTop: 60, flex: 1, marginVertical: 100 },

    sectionLabel: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.textSubtle,
      letterSpacing: 0.8, marginBottom: 12, textTransform: 'uppercase',
    },
    sectionLabelSpaced: { marginTop: 8 },

    showMoreBtn: { alignItems: 'center', paddingVertical: 10, marginBottom: 24 },
    showMoreText: { fontSize: 14, fontFamily: 'Inter-Bold', color: colors.primary },

    generateSection: { marginTop: 8 },
    generateLabel: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.textSubtle,
      letterSpacing: 0.8, marginBottom: 12, textTransform: 'uppercase',
    },
  });
