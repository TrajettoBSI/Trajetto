import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },

    hero: {
      paddingHorizontal: 22, paddingBottom: 26, gap: 22, backgroundColor: colors.primaryDark,
      borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: 'hidden',
    },
    heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
    heroText: { flex: 1 },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingBottom: 8,
      paddingHorizontal: 24,
    },
    headerTitleIos: { fontSize: 16, fontFamily: 'Jakarta-Bold', color: colors.text },
    headerTitleAndroid: { fontSize: 24, fontFamily: 'Display-Bold', color: colors.text },
    headerTitle: { fontSize: 38, lineHeight: 42, letterSpacing: -1, fontFamily: 'Display-Black', color: colors.onPrimary },
    headerGreeting: { fontSize: 15, fontFamily: 'Jakarta-Medium', color: colors.onPrimaryFaint80, marginBottom: 4 },
    cancelSelectText: { fontSize: 15, color: colors.primaryText, fontFamily: 'Jakarta-Medium' },
    selectAllText: { fontSize: 15, color: colors.primaryText, fontFamily: 'Jakarta-Medium' },
    avatarBtn: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: colors.glassSurface,
      borderWidth: 1, borderColor: colors.glassBorderStrong,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarInitial: { fontSize: 18, fontFamily: 'Jakarta-Bold', color: colors.onPrimary },

    content: { flexGrow: 1, padding: 20, paddingTop: 20, paddingBottom: 120, backgroundColor: colors.background },

    centerState: { alignItems: 'center', paddingTop: 60, flex: 1, marginVertical: 100 },

    sectionLabel: { fontSize: 22, letterSpacing: -0.4, fontFamily: 'Display-Bold', color: colors.text, marginBottom: 12 },
    sectionLabelSpaced: { marginTop: 20 },

    showMoreBtn: { alignItems: 'center', paddingVertical: 10, marginBottom: 24 },
    showMoreText: { fontSize: 14, fontFamily: 'Jakarta-Bold', color: colors.primaryText },

    generateSection: { marginBottom: 24 },
    generateLabel: { fontSize: 14, fontFamily: 'Jakarta-Medium', color: colors.textMuted, marginBottom: 10 },
  });
