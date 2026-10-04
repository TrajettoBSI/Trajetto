import { Platform, StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.backgroundMuted },
    background: { ...StyleSheet.absoluteFill },
    overlay: { flex: 1 },
    headerTitle: {
      fontSize: Platform.OS === 'ios' ? 16 : 24,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      paddingTop: 16,
      paddingHorizontal: 24,
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  });
