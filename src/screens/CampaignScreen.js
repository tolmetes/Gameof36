// src/screens/CampaignScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../themes/ThemeContext';
import { getProgress, isWorldUnlocked } from '../data/storage';
import { DIFFICULTIES } from '../logic/difficultyConfig';
import { ProgressBar } from '../components';

const WORLDS = ['easy', 'medium', 'hard'];

function WorldCard({ difficulty, progress, stars, isLocked, onPress, theme }) {
  const config = DIFFICULTIES[difficulty];
  const color = theme.colors[config.color];

  return (
    <TouchableOpacity
      style={[
        styles.worldCard,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          opacity: isLocked ? 0.6 : 1,
        },
      ]}
      onPress={onPress}
      disabled={isLocked}
      activeOpacity={0.8}
    >
      <View style={styles.worldHeader}>
        <View style={[styles.worldBadge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.worldBadgeText, { color }]}>
            {config.name.charAt(0)}
          </Text>
        </View>
        <View style={styles.worldInfo}>
          <Text style={[styles.worldTitle, { color: theme.colors.text }]}>
            {config.name}
          </Text>
          <Text style={[styles.worldSubtitle, { color: theme.colors.textMuted }]}>
            {progress}/{config.totalLevels} levels
          </Text>
        </View>
        {isLocked ? (
          <View style={styles.lockContainer}>
            <Text style={[styles.lockIcon, { color: theme.colors.textMuted }]}>
              &#x1F512;
            </Text>
          </View>
        ) : (
          <View style={styles.starsContainer}>
            <Text style={[styles.starIcon, { color: theme.colors.secondary }]}>
              &#x2B50;
            </Text>
            <Text style={[styles.starsText, { color: theme.colors.textMuted }]}>
              {stars}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.worldProgress}>
        <ProgressBar
          current={progress}
          total={config.totalLevels}
          color={color}
          animated={false}
        />
      </View>

      {isLocked && (
        <Text style={[styles.unlockHint, { color: theme.colors.textMuted }]}>
          Complete more levels to unlock
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function CampaignScreen({ navigation }) {
  const { theme } = useTheme();
  const [worldData, setWorldData] = useState({
    easy: { progress: 0, stars: 0, unlocked: true },
    medium: { progress: 0, stars: 0, unlocked: false },
    hard: { progress: 0, stars: 0, unlocked: false },
  });

  const loadData = useCallback(async () => {
    try {
      const progress = await getProgress();
      const data = {};

      for (const difficulty of WORLDS) {
        const levels = progress.campaign[difficulty];
        const completedCount = Object.keys(levels).length;
        const starsCount = Object.values(levels).reduce(
          (sum, l) => sum + (l.stars || 0),
          0
        );
        const unlocked = await isWorldUnlocked(difficulty);

        data[difficulty] = {
          progress: completedCount,
          stars: starsCount,
          unlocked,
        };
      }

      setWorldData(data);
    } catch (error) {
      console.warn('Failed to load campaign data:', error);
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
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backIcon, { color: theme.colors.text }]}>
            &#x2190;
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Campaign
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {WORLDS.map((difficulty) => (
          <WorldCard
            key={difficulty}
            difficulty={difficulty}
            progress={worldData[difficulty].progress}
            stars={worldData[difficulty].stars}
            isLocked={!worldData[difficulty].unlocked}
            onPress={() =>
              navigation.navigate('LevelSelect', { difficulty })
            }
            theme={theme}
          />
        ))}
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
    paddingBottom: 32,
  },
  worldCard: {
    padding: 20,
    marginBottom: 16,
  },
  worldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  worldBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  worldBadgeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  worldInfo: {
    flex: 1,
  },
  worldTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  worldSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  lockContainer: {
    padding: 8,
  },
  lockIcon: {
    fontSize: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  starsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  worldProgress: {
    marginTop: 8,
  },
  unlockHint: {
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
});
