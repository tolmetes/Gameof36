// src/screens/SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../themes/ThemeContext';
import { getSettings } from '../data/storage';

export default function SplashScreen({ navigation }) {
  const { theme } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animate logo appearance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Check tutorial status and navigate after 1.5s
    const timer = setTimeout(async () => {
      try {
        const settings = await getSettings();
        if (settings.tutorialCompleted) {
          navigation.replace('Home');
        } else {
          navigation.replace('Tutorial');
        }
      } catch (error) {
        // If error, go to home
        navigation.replace('Home');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim]);

  return (
    <LinearGradient
      colors={theme.colors.background}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={[styles.logoText, { color: theme.colors.text }]}>
          GAME OF
        </Text>
        <Text
          style={[
            styles.logoNumber,
            { color: theme.colors.primary },
          ]}
        >
          36
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: 8,
  },
  logoNumber: {
    fontSize: 96,
    fontWeight: 'bold',
  },
});
