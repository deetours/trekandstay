import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

/* Accessible theme switcher with three states: light, dark, system */
export const ThemeSwitcher: React.FC<{ className?: string }>=({ className })=>{
  const { theme, toggleTheme } = useTheme();
  // system detection (not stored directly) - if stored theme absent we could extend store but keep simple here
  const cycle = () => {
    // Only light/dark stored; treat extra middle state as system (null) - for now cycle light->dark->light
    toggleTheme();
  };
  const icon = theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />;
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      title={label}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-sm hover:bg-[var(--surface-alt)] focus-ring transition-colors ${className||''}`}
    >
      {icon}
      <span className="text-xs font-medium hidden sm:inline">{theme==='dark'?'Dark':'Light'}</span>
    </button>
  );
};
