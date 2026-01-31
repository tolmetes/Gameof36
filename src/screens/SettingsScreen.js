// src/screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../themes/ThemeContext';
import { getSettings, updateSettings } from '../data/storage';

function SettingRow({ title, subtitle, value, onValueChange, theme }) {
  return (
    <View
      style={[
        styles.settingRow,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
        },
      ]}
    >
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: theme.colors.textMuted }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.colors.surfaceLight,
          true: theme.colors.primary + '80',
        }}
        thumbColor={value ? theme.colors.primary : theme.colors.textMuted}
      />
    </View>
  );
}

function SettingButton({ title, subtitle, onPress, theme }) {
  return (
    <TouchableOpacity
      style={[
        styles.settingRow,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: theme.colors.textMuted }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Text style={[styles.chevron, { color: theme.colors.textMuted }]}>
        &#x203A;
      </Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getSettings();
      setSoundEnabled(settings.soundEnabled ?? true);
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleSoundToggle = async (value) => {
    setSoundEnabled(value);
    try {
      await updateSettings({ soundEnabled: value });
    } catch (error) {
      console.warn('Failed to save sound setting:', error);
    }
  };

  const handleHowToPlay = () => {
    navigation.navigate('Tutorial');
  };

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backIcon, { color: theme.colors.text }]}>
            &#x2190;
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Settings
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Appearance Section */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
          APPEARANCE
        </Text>

        <SettingRow
          title="Dark Theme"
          subtitle={isDark ? 'Dark & Sleek' : 'Playful & Colorful'}
          value={isDark}
          onValueChange={handleThemeToggle}
          theme={theme}
        />

        {/* Audio Section */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
          AUDIO
        </Text>

        <SettingRow
          title="Sound Effects"
          subtitle="Tap and success sounds"
          value={soundEnabled}
          onValueChange={handleSoundToggle}
          theme={theme}
        />

        {/* Help Section */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
          HELP
        </Text>

        <SettingButton
          title="How to Play"
          subtitle="View the tutorial again"
          onPress={handleHowToPlay}
          theme={theme}
        />

        {/* About Section */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>
          ABOUT
        </Text>

        <View
          style={[
            styles.aboutCard,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
            },
          ]}
        >
          <Text style={[styles.appName, { color: theme.colors.text }]}>
            Game of 36
          </Text>
          <Text style={[styles.appVersion, { color: theme.colors.textMuted }]}>
            Version 2.0.0
          </Text>
          <Text style={[styles.appDescription, { color: theme.colors.textMuted }]}>
            Combine 4 numbers using math operations to make exactly 36.
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 44,
  },
  content: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
  },
  aboutCard: {
    padding: 20,
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
