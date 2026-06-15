'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme state from document classlist after mount
  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    }
  };

  // Prevent layout shifts during hydration by rendering a placeholder of the same size
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="relative w-10 h-10 rounded-lg bg-slate-50 hover:bg-sky-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 border border-slate-200/50 dark:border-slate-800/80 transition-all duration-300 flex items-center justify-center overflow-hidden focus:outline-none"
      aria-label="Toggle Night Mode"
    >
      <div className="relative w-5 h-5 transition-transform duration-500 ease-out transform-gpu">
        {/* Sun Icon */}
        <span
          className={`absolute inset-0 transition-all duration-500 ease-out ${
            theme === 'dark'
              ? 'opacity-0 rotate-90 scale-50 pointer-events-none'
              : 'opacity-100 rotate-0 scale-100'
          }`}
        >
          <Sun className="h-5 w-5" />
        </span>
        
        {/* Moon Icon */}
        <span
          className={`absolute inset-0 transition-all duration-500 ease-out ${
            theme === 'light'
              ? 'opacity-0 -rotate-90 scale-50 pointer-events-none'
              : 'opacity-100 rotate-0 scale-100'
          }`}
        >
          <Moon className="h-5 w-5" />
        </span>
      </div>
    </button>
  );
}
