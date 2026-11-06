import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: colors.white,
      borderRadius: 24,
      paddingVertical: 14,
      paddingHorizontal: 14,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOpacity: 0.07,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    iconBadge: {
      width: 50,
      height: 50,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textWrapper: { flex: 1 },
    title: { fontSize: 17, fontFamily: 'Display-Bold', color: colors.text },
    subtitle: { fontSize: 13, lineHeight: 18, color: colors.textSubtle, marginTop: 2 },
  });
