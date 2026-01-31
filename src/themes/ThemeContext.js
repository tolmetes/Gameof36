// src/themes/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme } from './dark';
import { playfulTheme } from './playful';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = '@game36_theme';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(darkTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'playful') {
        setTheme(playfulTheme);
      } else {
        setTheme(darkTheme);
      }
    } catch (error) {
      console.warn('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme.name === 'dark' ? playfulTheme : darkTheme;
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme.name);
    } catch (error) {
      console.warn('Failed to save theme:', error);
    }
  };

  const value = {
    theme,
    isDark: theme.name === 'dark',
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
