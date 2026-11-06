import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useTheme } from '@/src/theme';

export function useLightStatusBar() {
  const { scheme } = useTheme();

  useFocusEffect(useCallback(() => {
    setStatusBarStyle('light');
    return () => setStatusBarStyle(scheme === 'dark' ? 'light' : 'dark');
  }, [scheme]));
}
