// src/screens/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../themes/ThemeContext';
import { getProgress, getStreaks } from '../data/storage';

const { width } = Dimensions.get('window');

function MenuCard({ title, subtitle, icon, progress, color, onPress, theme }) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardIcon, { color }]}>{icon}</Text>
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
          <Text style={[styles.cardProgress, { color: theme.colors.textMuted }]}>
            {progress}
          </Text>
        )}
      </View>
    </TouchableOpacity>
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
        <MenuCard
          title="Campaign"
          subtitle="Master the 36"
          icon="&#x1F3AF;"
          progress={campaignProgress}
          color={theme.colors.easy}
          onPress={() => navigation.navigate('Campaign')}
          theme={theme}
        />

        <MenuCard
          title="Endless"
          subtitle="Never-ending puzzles"
          icon="&#x221E;"
          progress={streak > 0 ? `${streak} day streak` : null}
          color={theme.colors.secondary}
          onPress={() => navigation.navigate('Endless')}
          theme={theme}
        />

        <MenuCard
          title="Stats"
          subtitle="Your journey"
          icon="&#x1F4CA;"
          progress={`${totalStars} stars`}
          color={theme.colors.medium}
          onPress={() => navigation.navigate('Stats')}
          theme={theme}
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
    marginBottom: 32,
  },
  logoContainer: {
    alignItems: 'flex-start',
  },
  logoText: {
    fontSize: 16,
    fontWeight: '300',
    letterSpacing: 4,
  },
  logoNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: -8,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 24,
  },
  menuContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  card: {
    padding: 20,
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  cardProgress: {
    fontSize: 14,
  },
});
