import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.backgroundMuted },
    background: { ...StyleSheet.absoluteFill },
    overlay: { flex: 1 },
    headerTitle: {
      fontSize: 17,
      fontFamily: 'Jakarta-Bold',
      color: colors.text,
      paddingTop: 16,
      paddingHorizontal: 24,
    },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  });
