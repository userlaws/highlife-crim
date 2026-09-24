'use client';
import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    let theme = 'light';
    try { theme = localStorage.getItem('how-to-crim-theme-v2') === 'dark' ? 'dark' : 'light'; } catch {}
    const isDark = theme === 'dark';
    setDark(isDark);
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', isDark);
  }, []);
  function change(isDark: boolean) {
    setDark(isDark);
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', isDark);
    try { localStorage.setItem('how-to-crim-theme-v2', isDark ? 'dark' : 'light'); } catch {}
  }
  return <div className="theme-switch" aria-label="Color theme"><span className="theme-glyph" aria-hidden="true">Light</span><Switch checked={dark} onCheckedChange={change} aria-label={`Use ${dark ? 'light' : 'dark'} mode`} /><span className="theme-glyph" aria-hidden="true">Dark</span></div>;
}
