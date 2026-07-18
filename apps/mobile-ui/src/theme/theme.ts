import { useEffect, useState } from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, type Colors } from './tokens';

const THEME_KEY = 'homehelp_theme_pref';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface ThemeContextValue {
  colors: Colors;
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => Promise<void>;
}

let cachedPreference: ThemePreference | null = null;

export async function loadThemePreference(): Promise<ThemePreference> {
  if (cachedPreference !== null) return cachedPreference;
  try {
    const stored = await AsyncStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      cachedPreference = stored;
      return stored;
    }
  } catch {}
  cachedPreference = 'system';
  return 'system';
}

export async function saveThemePreference(p: ThemePreference): Promise<void> {
  cachedPreference = p;
  try { await AsyncStorage.setItem(THEME_KEY, p); } catch {}
}

export function useThemeColors(preference: ThemePreference = 'system'): { colors: Colors; isDark: boolean } {
  const [scheme, setScheme] = useState<ColorSchemeName>(Appearance.getColorScheme() ?? 'light');

  useEffect(() => {
    if (preference !== 'system') {
      setScheme(preference);
      return;
    }
    const sub = Appearance.addChangeListener(({ colorScheme: next }) => {
      setScheme(next ?? 'light');
    });
    return () => sub.remove();
  }, [preference]);

  const isDark = preference === 'dark' || (preference === 'system' && scheme === 'dark');
  return { colors: isDark ? darkColors : lightColors, isDark };
}

export { lightColors, darkColors };
