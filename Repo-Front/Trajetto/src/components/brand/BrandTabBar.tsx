import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors, useColors } from '@/src/theme';

const ICONS: Record<string, { on: keyof typeof Ionicons.glyphMap; off: keyof typeof Ionicons.glyphMap }> = {
  index: { on: 'calendar', off: 'calendar-outline' },
  mapa: { on: 'map', off: 'map-outline' },
  itinerario: { on: 'navigate', off: 'navigate-outline' },
};
const SPRING = { damping: 17, stiffness: 190, mass: 0.8 };
const INSET = 6;

export default function BrandTabBar({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const s = styles(colors);
  const [width, setWidth] = useState(0);
  const itemWidth = width / state.routes.length;
  const x = useSharedValue(0);

  useEffect(() => {
    x.value = withSpring(state.index * itemWidth, SPRING);
  }, [state.index, itemWidth, x]);

  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      style={[s.bar, { bottom: insets.bottom + 8 }]}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width - INSET * 2)}
      accessibilityRole="tablist"
    >
      {width > 0 && (
        <Animated.View style={[s.indicator, { width: itemWidth }, indicatorStyle]}>
          <LinearGradient colors={colors.gradientAction} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.indicatorFill} />
        </Animated.View>
      )}
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const title = descriptors[route.key].options.title ?? route.name;
        const icon = ICONS[route.name] ?? ICONS.index;

        return (
          <Pressable
            key={route.key}
            style={s.item}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={title}
            onPress={() => {
              if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync().catch(() => {});
              const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigateToTab(route.key);
            }}
          >
            <Ionicons name={focused ? icon.on : icon.off} size={focused ? 18 : 22} color={focused ? colors.onPrimary : colors.tabBarIcon} />
            {focused && (
              <Animated.View entering={FadeIn.duration(220)}>
                <Text style={s.label} numberOfLines={1}>{title}</Text>
              </Animated.View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = (colors: AppColors) => StyleSheet.create({
  bar: {
    position: 'absolute', left: 24, right: 24, height: 64, borderRadius: 32,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: INSET,
    backgroundColor: colors.tabBar,
    borderWidth: 1, borderColor: colors.tabBarBorder,
    shadowColor: colors.shadow, shadowOpacity: 0.2, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  indicator: { position: 'absolute', left: INSET, top: 6, bottom: 6 },
  indicatorFill: { flex: 1, borderRadius: 26, marginHorizontal: 2 },
  item: { flex: 1, height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  label: { fontSize: 13, fontFamily: 'Jakarta-Bold', color: colors.onPrimary },
});
