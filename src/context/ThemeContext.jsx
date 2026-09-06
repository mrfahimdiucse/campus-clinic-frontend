import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // ১. লোকাল স্টোরেজ চেক
    const savedTheme = localStorage.getItem('campusclinic-theme');
    if (savedTheme) return savedTheme;
    // ২. সিস্টেম থিম প্রেফারেন্স চেক
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark'); // DaisyUI dark theme sync
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light'); // DaisyUI light theme sync
    }
    localStorage.setItem('campusclinic-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);