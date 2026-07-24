import React, { useEffect, useState, useContext, createContext } from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, type Colors } from './tokens';

const THEME_KEY = 'homehelp_theme_pref';
const THEME_CONTEXT = createContext<{
  colors: Colors;
  isDark: boolean;
  preference: 'system' | 'light' | 'dark';
  setPreference: (p: 'system' | 'light' | 'dark') => Promise<void>;
} | null>(null);

export type ThemePreference = 'system' | 'light' | 'dark';

export function ThemeProvider({ children, initialPreference }: { children: React.ReactNode; initialPreference?: ThemePreference }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(initialPreference ?? 'system');
  const [scheme, setScheme] = useState<ColorSchemeName>(Appearance.getColorScheme() ?? 'light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadPreference().then((p) => {
      setPreferenceState(p);
      setIsReady(true);
    });
    const sub = Appearance.addChangeListener(({ colorScheme: next }) => {
      setScheme(next ?? 'light');
    });
    return () => sub.remove();
  }, [initialPreference]);

  const isDark = preference === 'dark' || (preference === 'system' && scheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  async function setPreference(p: ThemePreference) {
    setPreferenceState(p);
    try { await AsyncStorage.setItem(THEME_KEY, p); } catch {}
  }

  return (
    <THEME_CONTEXT.Provider value={{ colors, isDark, preference, setPreference }}>
      {isReady ? children : null}
    </THEME_CONTEXT.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(THEME_CONTEXT);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}

async function loadPreference(): Promise<ThemePreference> {
  try {
    const stored = await AsyncStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {}
  return 'system';
}
