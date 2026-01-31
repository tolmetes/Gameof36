import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/themes/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </ThemeProvider>
  );
}
