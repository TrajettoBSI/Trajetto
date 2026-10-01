import { Dimensions, StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

const { width } = Dimensions.get('window');

export const SVG_HEIGHT = 160;
export const AVATAR_SIZE = 108;
const AVATAR_TOP = 61;

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    wrapper: { marginBottom: 24 },
    svg: { position: 'absolute', top: 0, left: 0 },
    patternIcon: { position: 'absolute' },
    avatarCircle: {
      position: 'absolute',
      top: AVATAR_TOP,
      left: width / 2 - AVATAR_SIZE / 2,
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 4,
      borderColor: colors.white,
      shadowColor: colors.shadow,
      shadowOpacity: 0.15,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    info: {
      marginTop: AVATAR_TOP + AVATAR_SIZE + 10,
      alignItems: 'center',
    },
    userName: { fontSize: 20, fontFamily: 'Inter-Bold', color: colors.text, marginBottom: 2 },
    userEmail: { fontSize: 13, color: colors.textSubtle, marginBottom: 10 },
    profileBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primarySurface,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    profileBadgeText: { color: colors.primary, fontSize: 13, fontFamily: 'Inter-Bold' },
  });
