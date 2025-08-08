// Design tokens and theme utilities
export const tokens = {
  colors: {
    primary: '#1B4332',
    accent: '#FF6B35',
    muted: '#264653',
    background: '#FFFFFF',
    foreground: '#0B0F10',
    // dark
    darkBackground: '#0B0F10',
    darkCard: '#111827',
    darkText: '#E5E7EB',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  shadow: {
    soft: '0 10px 25px -10px rgba(0,0,0,0.15)',
    glow: '0 0 20px rgba(255, 107, 53, 0.35)',
  },
};

const THEME_KEY = 'theme-preference';
export type ThemeMode = 'light' | 'dark';

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') return null;
  return (localStorage.getItem(THEME_KEY) as ThemeMode | null) ?? null;
}

export function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function setTheme(mode: ThemeMode) {
  localStorage.setItem(THEME_KEY, mode);
  applyTheme(mode);
}

export function initTheme() {
  const stored = getStoredTheme();
  if (stored) {
    applyTheme(stored);
    return stored;
  }
  // Fallback to system preference
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const mode: ThemeMode = prefersDark ? 'dark' : 'light';
  applyTheme(mode);
  return mode;
}

export function toggleTheme(): ThemeMode {
  const isDark = document.documentElement.classList.contains('dark');
  const next: ThemeMode = isDark ? 'light' : 'dark';
  setTheme(next);
  return next;
}
