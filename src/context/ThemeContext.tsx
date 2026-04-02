'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = 'theme';

export function ThemeProvider({
                                children,
                              }: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>('light');

  /**
   * 初始化主题（只执行一次）
   */
  useEffect(() => {
    const initializeTheme = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;

        if (stored === 'light' || stored === 'dark') {
          setThemeState(stored);
        } else {
          const prefersDark = window.matchMedia(
              '(prefers-color-scheme: dark)'
          ).matches;
          setThemeState(prefersDark ? 'dark' : 'light');
        }
      }
    };

    initializeTheme();
  }, []);

  /**
   * 同步到 DOM & localStorage
   */
  useEffect(() => {
    const root = document.documentElement;

    // 推荐统一用 data-theme（更语义化）
    root.setAttribute('data-theme', theme);

    // Tailwind dark 模式兼容
    root.classList.toggle('dark', theme === 'dark');

    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  const toggleTheme = () => {
    setThemeState((prev) =>
        prev === 'light' ? 'dark' : 'light'
    );
  };

  return (
      <ThemeContext.Provider
          value={{
            theme,
            setTheme,
            toggleTheme,
            isDark: theme === 'dark',
          }}
      >
        {children}
      </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
        'useTheme must be used within ThemeProvider'
    );
  }

  return context;
}