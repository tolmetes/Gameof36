// src/screens/ResultScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      {/* Success Icon */}
      <Animated.View
        style={[
          styles.successContainer,
          {
            transform: [{ scale: checkAnim }],
            opacity: checkAnim,
          },
        ]}
      >
        <View
          style={[
            styles.checkCircle,
            {
              backgroundColor: theme.colors.success + '20',
              borderColor: theme.colors.success,
            },
          ]}
        >
          <Text style={[styles.checkmark, { color: theme.colors.success }]}>
            &#x2713;
          </Text>
        </View>
        <Text style={[styles.targetNumber, { color: theme.colors.success }]}>
          36
        </Text>
      </Animated.View>

      {/* Stars */}
      <Animated.View style={[styles.starsContainer, { opacity: fadeAnim }]}>
        <StarRating stars={stars} size="large" animated />
        <Text style={[styles.message, { color: theme.colors.text }]}>
          {message}
        </Text>
      </Animated.View>

      {/* Stats */}
      <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
        <View
          style={[
            styles.statsCard,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
            },
          ]}
        >
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {moves}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                Moves
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {time}s
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                Time
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: accentColor }]}>
                {optimalMoves}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                Optimal
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Streak */}
      {streak > 1 && (
        <Animated.View style={[styles.streakContainer, { opacity: fadeAnim }]}>
          <Text style={[styles.streakIcon, { color: theme.colors.secondary }]}>
            &#x1F525;
          </Text>
          <Text style={[styles.streakText, { color: theme.colors.text }]}>
            {streak} solve streak
          </Text>
        </Animated.View>
      )}

      {/* Buttons */}
      <Animated.View style={[styles.buttons, { opacity: fadeAnim }]}>
        <Button
          title="Home"
          onPress={handleHome}
          variant="secondary"
          size="large"
        />
        <View style={styles.buttonSpacer} />
        <Button
          title={level < config.totalLevels ? 'Next Level' : 'Complete!'}
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
    marginBottom: 24,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 40,
  },
  targetNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  starsContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  message: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 12,
  },
  statsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  statsCard: {
    padding: 20,
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
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  streakIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '500',
  },
  buttons: {
    flexDirection: 'row',
    width: '100%',
  },
  buttonSpacer: {
    width: 16,
  },
});
