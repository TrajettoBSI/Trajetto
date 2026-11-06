import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import PressableScale from '@/src/components/motion/PressableScale';
import { useColors } from '@/src/theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function CustomButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}: CustomButtonProps) {
  const colors = useColors();
  const buttonStyles = getStyles(colors);
  const isButtonDisabled = disabled || loading;
  const flat = StyleSheet.flatten(style) ?? {};

  return (
    <PressableScale
      style={[buttonStyles.button, style, isButtonDisabled && buttonStyles.buttonDisabled]}
      onPress={onPress}
      disabled={isButtonDisabled}
      haptic
      accessibilityRole="button"
    >
      {!flat.backgroundColor && (
        <LinearGradient
          colors={colors.gradientAction}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: flat.borderRadius ?? 18 }]}
        />
      )}
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} />
      ) : (
        <View style={buttonStyles.content}>
          {icon ? (
            typeof icon === 'string'
              ? <Text style={buttonStyles.icon}>{icon}</Text>
              : icon
          ) : null}
          <Text style={[buttonStyles.buttonText, textStyle]}>{title}</Text>
        </View>
      )}
    </PressableScale>
  );
}

const getStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    minHeight: 52,
  },
  buttonDisabled: { opacity: 0.6 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { fontSize: 22 },
  buttonText: { color: colors.onPrimary, fontFamily: 'Jakarta-Bold', fontSize: 17 },
});