// src/screens/ResultScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Trophy, Zap } from 'lucide-react-native';
import { useTheme } from '../themes/ThemeContext';
import { Button, StarRating } from '../components';
import { getStarMessage } from '../logic/starCalculator';
import { updateLevelProgress, updateStats, getStreaks, incrementSolveStreak } from '../data/storage';
import { DIFFICULTIES } from '../logic/difficultyConfig';

export default function ResultScreen({ navigation, route }) {
  const { difficulty, level, stars, moves, time, optimalMoves } = route.params;
  const { theme } = useTheme();
  const config = DIFFICULTIES[difficulty];
  const accentColor = theme.colors[config.color];

  const [streak, setStreak] = useState(0);
  const [saved, setSaved] = useState(false);

  // Animations
  const checkAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Save progress
    saveProgress();

    // Run animations
    Animated.sequence([
      Animated.spring(checkAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const saveProgress = async () => {
    if (saved) return;

    try {
      // Update level progress
      await updateLevelProgress(difficulty, level, {
        stars,
        time,
        moves,
      });

      // Update stats
      await updateStats({
        stars,
        time,
        operatorsUsed: [], // Would need to track this in GameScreen
      });

      // Update solve streak
      const streaks = await incrementSolveStreak();
      setStreak(streaks.solve);

      setSaved(true);
    } catch (error) {
      console.warn('Failed to save progress:', error);
    }
  };

  const handleNext = () => {
    const nextLevel = level + 1;
    if (nextLevel <= config.totalLevels) {
      navigation.replace('Game', {
        difficulty,
        level: nextLevel,
      });
    } else {
      // Go back to campaign if no more levels
      navigation.navigate('Campaign');
    }
  };

  const handleHome = () => {
    navigation.navigate('Home');
  };

  const message = getStarMessage(stars);

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      {/* Success Animation */}
      <Animated.View
        style={[
          styles.successContainer,
          {
            transform: [{ scale: checkAnim }],
            opacity: checkAnim,
          },
        ]}
      >
        {/* Decorative circles */}
        <View style={[styles.decorCircle, styles.decorCircle1, { borderColor: theme.colors.success + '30' }]} />
        <View style={[styles.decorCircle, styles.decorCircle2, { borderColor: theme.colors.success + '20' }]} />

        <View
          style={[
            styles.checkCircle,
            {
              backgroundColor: theme.colors.success + '15',
              borderColor: theme.colors.success,
            },
          ]}
        >
          <Text style={[styles.targetNumber, { color: theme.colors.success }]}>
            36
          </Text>
        </View>
      </Animated.View>

      {/* Stars Section */}
      <Animated.View style={[styles.starsSection, { opacity: fadeAnim }]}>
        <StarRating stars={stars} size="large" animated />
        <Text style={[styles.message, { color: theme.colors.text }]}>
          {message}
        </Text>
        <View style={[styles.levelBadge, { backgroundColor: accentColor + '20' }]}>
          <Text style={[styles.levelBadgeText, { color: accentColor }]}>
            Level {level} • {config.name}
          </Text>
        </View>
      </Animated.View>

      {/* Stats Card */}
      <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
        <View
          style={[
            styles.statsCard,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.xl,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 6,
            },
          ]}
        >
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {moves}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                MOVES
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.textMuted + '30' }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {time}s
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                TIME
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.colors.textMuted + '30' }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: accentColor }]}>
                {optimalMoves}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                OPTIMAL
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Streak Badge */}
      {streak > 1 && (
        <Animated.View
          style={[
            styles.streakContainer,
            {
              opacity: fadeAnim,
              backgroundColor: theme.colors.secondary + '15',
            },
          ]}
        >
          <Flame
            size={22}
            color={theme.colors.secondary}
            strokeWidth={2}
            fill={theme.colors.secondary}
          />
          <Text style={[styles.streakText, { color: theme.colors.secondary }]}>
            {streak} in a row!
          </Text>
        </Animated.View>
      )}

      {/* Action Buttons */}
      <Animated.View style={[styles.buttons, { opacity: fadeAnim }]}>
        <Button
          title="Home"
          onPress={handleHome}
          variant="secondary"
          size="large"
        />
        <View style={styles.buttonSpacer} />
        <Button
          title={level < config.totalLevels ? 'Next →' : 'Complete!'}
          onPress={handleNext}
          variant="primary"
          size="large"
        />
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 2,
  },
  decorCircle1: {
    width: 140,
    height: 140,
  },
  decorCircle2: {
    width: 180,
    height: 180,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetNumber: {
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1,
  },
  starsSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  message: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 14,
    letterSpacing: 0.5,
  },
  levelBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  statsCard: {
    padding: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 30,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 6,
  },
  statDivider: {
    width: 1,
    height: 44,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 10,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '700',
  },
  buttons: {
    flexDirection: 'row',
    width: '100%',
  },
  buttonSpacer: {
    width: 14,
  },
});
