// src/screens/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../themes/ThemeContext';
import { getProgress, getStreaks } from '../data/storage';

const { width } = Dimensions.get('window');

function MenuCard({ title, subtitle, icon, progress, color, onPress, theme, index }) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.xl,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: theme.name === 'dark' ? 0.3 : 0.1,
            shadowRadius: 12,
            elevation: 6,
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Accent bar on left */}
        <View style={[styles.cardAccent, { backgroundColor: color }]} />

        <View style={styles.cardContent}>
          <View style={styles.cardMain}>
            {/* Icon container with background */}
            <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
              <Text style={[styles.cardIcon, { color }]}>{icon}</Text>
            </View>

            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                {title}
              </Text>
              <Text style={[styles.cardSubtitle, { color: theme.colors.textMuted }]}>
                {subtitle}
              </Text>
            </View>
          </View>

          {progress && (
            <View style={[styles.progressBadge, { backgroundColor: theme.colors.surfaceLight || color + '10' }]}>
              <Text style={[styles.cardProgress, { color: color }]}>
                {progress}
              </Text>
            </View>
          )}
        </View>

        {/* Arrow indicator */}
        <View style={styles.arrowContainer}>
          <Text style={[styles.arrow, { color: theme.colors.textMuted }]}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const [campaignProgress, setCampaignProgress] = useState('0/55 levels');
  const [streak, setStreak] = useState(0);
  const [totalStars, setTotalStars] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const progress = await getProgress();
      const streaks = await getStreaks();

      // Calculate total completed levels
      const easyCount = Object.keys(progress.campaign.easy).length;
      const mediumCount = Object.keys(progress.campaign.medium).length;
      const hardCount = Object.keys(progress.campaign.hard).length;
      const total = easyCount + mediumCount + hardCount;

      setCampaignProgress(`${total}/55 levels`);
      setStreak(streaks.daily || 0);

      // Calculate total stars
      const countStars = (levels) =>
        Object.values(levels).reduce((sum, l) => sum + (l.stars || 0), 0);
      const stars =
        countStars(progress.campaign.easy) +
        countStars(progress.campaign.medium) +
        countStars(progress.campaign.hard);
      setTotalStars(stars);
    } catch (error) {
      console.warn('Failed to load home data:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, { color: theme.colors.text }]}>
            GAME OF
          </Text>
          <Text style={[styles.logoNumber, { color: theme.colors.primary }]}>
            36
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.settingsButton,
            { backgroundColor: theme.colors.surface },
          ]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={[styles.settingsIcon, { color: theme.colors.textMuted }]}>
            &#x2699;
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Label */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>
          PLAY
        </Text>

        <MenuCard
          title="Campaign"
          subtitle="55 puzzles across 3 worlds"
          icon="&#x1F3AF;"
          progress={campaignProgress}
          color={theme.colors.easy}
          onPress={() => navigation.navigate('Campaign')}
          theme={theme}
          index={0}
        />

        <MenuCard
          title="Endless"
          subtitle="Test your skills, no limits"
          icon="&#x221E;"
          progress={streak > 0 ? `${streak} day streak` : 'Start playing'}
          color={theme.colors.secondary}
          onPress={() => navigation.navigate('Endless')}
          theme={theme}
          index={1}
        />

        {/* Section Label */}
        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced, { color: theme.colors.textMuted }]}>
          PROGRESS
        </Text>

        <MenuCard
          title="Statistics"
          subtitle="Track your achievements"
          icon="&#x1F4CA;"
          progress={`${totalStars} ★`}
          color={theme.colors.medium}
          onPress={() => navigation.navigate('Stats')}
          theme={theme}
          index={2}
        />
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'flex-start',
  },
  logoText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 6,
    opacity: 0.7,
  },
  logoNumber: {
    fontSize: 56,
    fontWeight: '800',
    marginTop: -4,
    letterSpacing: -2,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 22,
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionLabelSpaced: {
    marginTop: 24,
  },
  card: {
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardAccent: {
    width: 4,
    alignSelf: 'stretch',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    paddingLeft: 16,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardIcon: {
    fontSize: 26,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.8,
  },
  progressBadge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cardProgress: {
    fontSize: 12,
    fontWeight: '600',
  },
  arrowContainer: {
    paddingRight: 16,
  },
  arrow: {
    fontSize: 28,
    fontWeight: '300',
  },
});
