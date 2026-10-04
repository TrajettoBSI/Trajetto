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
      paddingBottom: 12,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    headerBackBtn: { padding: 4, marginRight: 4 },
    headerTitle: { fontSize: 20, fontFamily: 'Inter-Bold', color: colors.text },
    headerSub: { fontSize: 13, color: colors.textSubtle, marginTop: 2 },

    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    list: { paddingHorizontal: 16, paddingBottom: 32, flexGrow: 1 },

    sectionLabel: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.textSubtle,
      letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12,
    },
  });
