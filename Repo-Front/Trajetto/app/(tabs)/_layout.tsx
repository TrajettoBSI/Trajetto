import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import BrandTabBar from '@/src/components/brand/BrandTabBar';

export const unstable_settings = { anchor: 'index' };

export default function TabLayout() {
  const { t } = useTranslation('common');

  return (
    <Tabs
      backBehavior="initialRoute"
      tabBar={(props) => <BrandTabBar {...props} />}
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabHome') }} />
      <Tabs.Screen name="mapa" options={{ title: t('tabMap') }} />
      <Tabs.Screen name="itinerario" options={{ title: 'Trajetto' }} />
    </Tabs>
  );
}
