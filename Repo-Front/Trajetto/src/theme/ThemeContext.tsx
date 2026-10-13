import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppColors, darkColors, highContrastColors, lightColors } from './colors';

export const THEME_PREFERENCES = ['system', 'light', 'dark', 'highContrast'] as const;
export type ThemePreference = typeof THEME_PREFERENCES[number];
export type ThemeScheme = 'light' | 'dark' | 'highContrast';

export const THEME_STORAGE_KEY = 'app_theme';

const PALETTES: Record<ThemeScheme, AppColors> = {
  light: lightColors,
  dark: darkColors,
  highContrast: highContrastColors,
};

type ThemeContextValue = {
  preference: ThemePreference;
  scheme: ThemeScheme;
  colors: AppColors;
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const isThemePreference = (value: unknown): value is ThemePreference =>
  THEME_PREFERENCES.includes(value as ThemePreference);

export function resolveScheme(preference: ThemePreference, system: string | null | undefined): ThemeScheme {
  if (preference === 'system') return system === 'dark' ? 'dark' : 'light';
  return preference;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => { if (isThemePreference(saved)) setPreferenceState(saved); })
      .catch(() => undefined);
  }, []);

  const setPreference = useCallback(async (next: ThemePreference) => {
    setPreferenceState(next);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const value = useMemo(() => {
    const scheme = resolveScheme(preference, system);
    return { preference, scheme, colors: PALETTES[scheme], setPreference };
  }, [preference, system, setPreference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

const FALLBACK: ThemeContextValue = {
  preference: 'light',
  scheme: 'light',
  colors: lightColors,
  setPreference: async () => undefined,
};

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext) ?? FALLBACK;
}
