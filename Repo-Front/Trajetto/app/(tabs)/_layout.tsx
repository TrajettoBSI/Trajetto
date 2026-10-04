import { Tabs } from 'expo-router';
import React from 'react';
import { View, ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { useColors, AppColors } from '@/src/theme';

function TabIcon({ focused, color, colors, outlineName, filledName }: {
  focused: boolean; color: ColorValue; colors: AppColors; outlineName: any; filledName: any;
}) {
  if (focused) {
    return (
      <View style={{
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: colors.primary,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Ionicons size={18} name={filledName} color={colors.white} />
      </View>
    );
  }
  return <Ionicons size={24} name={outlineName} color={color} />;
}

export default function TabLayout() {
  const { t } = useTranslation('common');
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          position: 'absolute',
          left: 32,
          right: 32,
          start: 32,
          end: 32,
          bottom: insets.bottom + 4,
          height: 64,
          borderRadius: 24,
          backgroundColor: colors.white,
          borderTopWidth: 0,
          shadowColor: colors.shadow,
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
          paddingTop: 8,
          paddingBottom: 8,
          paddingHorizontal: 16,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
          marginTop: 4,
        },
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: t('tabHome'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} colors={colors} outlineName="calendar-outline" filledName="calendar" />
          ),
        }}
      />

      <Tabs.Screen
        name="mapa"
        options={{
          title: t('tabMap'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} colors={colors} outlineName="map-outline" filledName="map" />
          ),
        }}
      />

      <Tabs.Screen
        name="itinerario"
        options={{
          title: 'Trajetto',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} colors={colors} outlineName="location-outline" filledName="location" />
          ),
        }}
      />
    </Tabs>
  );
}
