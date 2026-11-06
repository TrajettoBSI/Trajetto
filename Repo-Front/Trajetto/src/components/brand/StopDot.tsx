import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { placeColor, useColors } from '@/src/theme';

type StopDotProps = {
  index: number;
  past?: boolean;
  size?: number;
};

export default function StopDot({ index, past = false, size = 24 }: StopDotProps) {
  const colors = useColors();

  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center',
        backgroundColor: past ? colors.timelineDotPast : placeColor(colors, index),
      }}
    >
      {past
        ? <Ionicons name="checkmark" size={size * 0.58} color={colors.onPrimary} />
        : <Text style={{ fontSize: size * 0.46, fontFamily: 'Jakarta-Bold', color: colors.onPrimary }}>{index + 1}</Text>}
    </View>
  );
}
