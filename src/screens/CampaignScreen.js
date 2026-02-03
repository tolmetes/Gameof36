// src/screens/CampaignScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, Lock } from 'lucide-react-native';
import { useTheme } from '../themes/ThemeContext';
import { getProgress, isWorldUnlocked } from '../data/storage';
import { DIFFICULTIES } from '../logic/difficultyConfig';
import { ProgressBar } from '../components';

const WORLDS = ['easy', 'medium', 'hard'];

function WorldCard({ difficulty, progress, stars, isLocked, onPress, theme, index }) {
  const config = DIFFICULTIES[difficulty];
  const color = theme.colors[config.color];
  const maxStars = config.totalLevels * 3;
  const percentage = Math.round((progress / config.totalLevels) * 100);

  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 120,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    if (!isLocked) {
      Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.worldCard,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.xl,
            opacity: isLocked ? 0.5 : 1,
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
        disabled={isLocked}
        activeOpacity={1}
      >
        {/* Color accent bar */}
        <View style={[styles.worldAccent, { backgroundColor: color }]} />

        <View style={styles.worldContent}>
          {/* Header row */}
          <View style={styles.worldHeader}>
            <View style={[styles.worldBadge, { backgroundColor: color + '18' }]}>
              <Text style={[styles.worldBadgeText, { color }]}>
                {difficulty === 'easy' ? '★' : difficulty === 'medium' ? '★★' : '★★★'}
              </Text>
            </View>

            <View style={styles.worldInfo}>
              <Text style={[styles.worldTitle, { color: theme.colors.text }]}>
                {config.name}
              </Text>
              <Text style={[styles.worldOperators, { color: theme.colors.textMuted }]}>
                {config.operators.map(op => op === '*' ? '×' : op === '/' ? '÷' : op).join('  ')}
              </Text>
            </View>

            {isLocked ? (
              <View style={[styles.lockBadge, { backgroundColor: theme.colors.textMuted + '20' }]}>
                <Lock size={16} color={theme.colors.textMuted} strokeWidth={2.5} />
              </View>
            ) : (
              <View style={styles.percentBadge}>
                <Text style={[styles.percentText, { color }]}>
                  {percentage}%
                </Text>
              </View>
            )}
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <ProgressBar
              current={progress}
              total={config.totalLevels}
              color={color}
              animated={false}
            />

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{progress}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>/{config.totalLevels} levels</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.secondary }]}>★ {stars}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>/{maxStars}</Text>
              </View>
            </View>
          </View>

          {isLocked && (
            <View style={[styles.unlockHintContainer, { backgroundColor: theme.colors.textMuted + '10' }]}>
              <Text style={[styles.unlockHint, { color: theme.colors.textMuted }]}>
                Complete 16 levels to unlock
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
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
          <ChevronLeft size={22} color={theme.colors.text} strokeWidth={2.5} />
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
        {WORLDS.map((difficulty, index) => (
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
            index={index}
          />
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 44,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  worldCard: {
    marginBottom: 20,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  worldAccent: {
    width: 5,
  },
  worldContent: {
    flex: 1,
    padding: 20,
  },
  worldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  worldBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  worldBadgeText: {
    fontSize: 16,
    letterSpacing: -2,
  },
  worldInfo: {
    flex: 1,
  },
  worldTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  worldOperators: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: 2,
  },
  lockBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 18,
  },
  percentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  percentText: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressSection: {
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    marginLeft: 2,
  },
  unlockHintContainer: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  unlockHint: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
