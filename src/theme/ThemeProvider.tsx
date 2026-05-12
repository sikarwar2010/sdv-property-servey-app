import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { colorScheme as nwColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, type Theme } from './colors';
import { typography } from './typography';
import { spacing, radius, touchTarget, elevation } from './spacing';

type Mode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  mode: Mode;
  resolved: 'light' | 'dark';
  setMode: (mode: Mode) => void;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  touchTarget: typeof touchTarget;
  elevation: typeof elevation;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = '@theme-mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme();
  const [mode, setModeState] = useState<Mode>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => v && setModeState(v as Mode))
      .catch(() => undefined);
  }, []);

  // Push to NativeWind whenever mode changes
  useEffect(() => {
    nwColorScheme.set(mode);
  }, [mode]);

  const setMode = useCallback((next: Mode) => {
    setModeState(next);
    nwColorScheme.set(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const resolved: 'light' | 'dark' = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
    const theme = resolved === 'dark' ? darkTheme : lightTheme;
    return { theme, mode, resolved, setMode, typography, spacing, radius, touchTarget, elevation };
  }, [mode, systemScheme, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
