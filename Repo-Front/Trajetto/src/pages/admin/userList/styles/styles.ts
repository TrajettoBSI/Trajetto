import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.backgroundMuted },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 18,
      overflow: 'hidden',
      backgroundColor: colors.primaryDark,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    headerBackBtn: { padding: 4, marginRight: 4 },
    headerTitle: { fontSize: 24, letterSpacing: -0.4, fontFamily: 'Display-Bold', color: colors.onPrimary },
    headerSub: { fontSize: 13, color: colors.onPrimaryFaint80, marginTop: 2 },

    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    list: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 32, flexGrow: 1 },

    sectionLabel: { fontSize: 20, fontFamily: 'Display-Bold', color: colors.text, marginBottom: 12 },
  });
