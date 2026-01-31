// src/screens/StatsScreen.js
import React, { useState, useCallback, useEffect } from 'react';
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
import { useTheme } from '../themes/ThemeContext';
import { ProgressBar } from '../components';
import { getProgress, getStats, getStreaks } from '../data/storage';
import { DIFFICULTIES } from '../logic/difficultyConfig';

function StatCard({ title, children, theme, index = 0 }) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.xl,
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme.name === 'dark' ? 0.3 : 0.1,
          shadowRadius: 12,
          elevation: 6,
        },
      ]}
    >
      <Text style={[styles.cardTitle, { color: theme.colors.textMuted }]}>
        {title}
      </Text>
      {children}
    </Animated.View>
  );
}

export default function StatsScreen({ navigation }) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);

  const [overview, setOverview] = useState({
    totalPuzzles: 0,
    streak: 0,
    totalStars: 0,
  });

  const [campaignProgress, setCampaignProgress] = useState({
    easy: { completed: 0, total: 20, stars: 0 },
    medium: { completed: 0, total: 20, stars: 0 },
    hard: { completed: 0, total: 15, stars: 0 },
  });

  const [endlessStats, setEndlessStats] = useState({
    bestRun: 0,
    totalSolved: 0,
  });

  const [playStyle, setPlayStyle] = useState({
    avgTime: 0,
    favoriteOp: '+',
    favoriteOpPercent: 0,
    perfectSolves: 0,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [progress, stats, streaks] = await Promise.all([
        getProgress(),
        getStats(),
        getStreaks(),
      ]);

      // Calculate totals
      const countStars = (levels) =>
        Object.values(levels).reduce((sum, l) => sum + (l.stars || 0), 0);

      const easyStars = countStars(progress.campaign.easy);
      const mediumStars = countStars(progress.campaign.medium);
      const hardStars = countStars(progress.campaign.hard);
      const totalStars = easyStars + mediumStars + hardStars;

      setOverview({
        totalPuzzles: stats.totalPuzzlesSolved,
        streak: streaks.daily,
        totalStars,
      });

      setCampaignProgress({
        easy: {
          completed: Object.keys(progress.campaign.easy).length,
          total: DIFFICULTIES.easy.totalLevels,
          stars: easyStars,
        },
        medium: {
          completed: Object.keys(progress.campaign.medium).length,
          total: DIFFICULTIES.medium.totalLevels,
          stars: mediumStars,
        },
        hard: {
          completed: Object.keys(progress.campaign.hard).length,
          total: DIFFICULTIES.hard.totalLevels,
          stars: hardStars,
        },
      });

      setEndlessStats({
        bestRun: progress.endless?.bestRun || 0,
        totalSolved: progress.endless?.totalSolved || 0,
      });

      // Calculate play style
      const totalOps = Object.values(stats.operatorUsage).reduce(
        (sum, v) => sum + v,
        0
      );
      let favoriteOp = '+';
      let maxUsage = 0;

      for (const [op, count] of Object.entries(stats.operatorUsage)) {
        if (count > maxUsage) {
          maxUsage = count;
          favoriteOp = op;
        }
      }

      const opSymbols = { '+': '+', '-': '-', '*': '*', '/': '/' };
      const displayOp = opSymbols[favoriteOp] || favoriteOp;

      setPlayStyle({
        avgTime:
          stats.totalPuzzlesSolved > 0
            ? Math.round(stats.totalTimePlayed / stats.totalPuzzlesSolved)
            : 0,
        favoriteOp: displayOp,
        favoriteOpPercent:
          totalOps > 0 ? Math.round((maxUsage / totalOps) * 100) : 0,
        perfectSolves: stats.perfectSolves,
      });
    } catch (error) {
      console.warn('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const renderDifficultyRow = (difficulty, data) => {
    const config = DIFFICULTIES[difficulty];
    const color = theme.colors[config.color];
    const maxStars = data.total * 3;

    return (
      <View key={difficulty} style={styles.difficultyRow}>
        <View style={styles.difficultyHeader}>
          <Text style={[styles.difficultyName, { color }]}>{config.name}</Text>
          <Text style={[styles.difficultyProgress, { color: theme.colors.textMuted }]}>
            {data.completed}/{data.total}
          </Text>
        </View>
        <ProgressBar
          current={data.completed}
          total={data.total}
          color={color}
          animated={false}
        />
        <Text style={[styles.starsText, { color: theme.colors.secondary }]}>
          {data.stars}/{maxStars} stars
        </Text>
      </View>
    );
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
        <Text style={[styles.title, { color: theme.colors.text }]}>Stats</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview */}
        <StatCard title="OVERVIEW" theme={theme} index={0}>
          <View style={styles.overviewRow}>
            <View style={styles.overviewStat}>
              <View style={[styles.overviewIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                <Text style={[styles.overviewIcon]}>&#x1F9E9;</Text>
              </View>
              <Text style={[styles.overviewValue, { color: theme.colors.text }]}>
                {overview.totalPuzzles}
              </Text>
              <Text style={[styles.overviewLabel, { color: theme.colors.textMuted }]}>
                Puzzles
              </Text>
            </View>
            <View style={[styles.overviewDivider, { backgroundColor: theme.colors.textMuted + '20' }]} />
            <View style={styles.overviewStat}>
              <View style={[styles.overviewIconContainer, { backgroundColor: theme.colors.secondary + '15' }]}>
                <Text style={[styles.overviewIcon]}>&#x1F525;</Text>
              </View>
              <Text style={[styles.overviewValue, { color: theme.colors.text }]}>
                {overview.streak}
              </Text>
              <Text style={[styles.overviewLabel, { color: theme.colors.textMuted }]}>
                Days
              </Text>
            </View>
            <View style={[styles.overviewDivider, { backgroundColor: theme.colors.textMuted + '20' }]} />
            <View style={styles.overviewStat}>
              <View style={[styles.overviewIconContainer, { backgroundColor: theme.colors.easy + '15' }]}>
                <Text style={[styles.overviewIcon]}>&#x2B50;</Text>
              </View>
              <Text style={[styles.overviewValue, { color: theme.colors.text }]}>
                {overview.totalStars}
              </Text>
              <Text style={[styles.overviewLabel, { color: theme.colors.textMuted }]}>
                Stars
              </Text>
            </View>
          </View>
        </StatCard>

        {/* Campaign Progress */}
        <StatCard title="CAMPAIGN PROGRESS" theme={theme} index={1}>
          {renderDifficultyRow('easy', campaignProgress.easy)}
          {renderDifficultyRow('medium', campaignProgress.medium)}
          {renderDifficultyRow('hard', campaignProgress.hard)}
        </StatCard>

        {/* Endless Mode */}
        <StatCard title="ENDLESS MODE" theme={theme} index={2}>
          <View style={styles.endlessRow}>
            <View style={styles.endlessStat}>
              <View style={[styles.endlessValueContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                <Text style={[styles.endlessValue, { color: theme.colors.primary }]}>
                  {endlessStats.bestRun}
                </Text>
              </View>
              <Text style={[styles.endlessLabel, { color: theme.colors.textMuted }]}>
                Best Run
              </Text>
            </View>
            <View style={styles.endlessStat}>
              <View style={[styles.endlessValueContainer, { backgroundColor: theme.colors.textMuted + '15' }]}>
                <Text style={[styles.endlessValue, { color: theme.colors.text }]}>
                  {endlessStats.totalSolved}
                </Text>
              </View>
              <Text style={[styles.endlessLabel, { color: theme.colors.textMuted }]}>
                Total Solved
              </Text>
            </View>
          </View>
        </StatCard>

        {/* Play Style */}
        <StatCard title="PLAY STYLE" theme={theme} index={3}>
          <View style={styles.playStyleGrid}>
            <View style={styles.playStyleItem}>
              <View style={[styles.playStyleValueContainer, { backgroundColor: theme.colors.primary + '10' }]}>
                <Text style={[styles.playStyleValue, { color: theme.colors.text }]}>
                  {playStyle.avgTime}s
                </Text>
              </View>
              <Text style={[styles.playStyleLabel, { color: theme.colors.textMuted }]}>
                Avg Time
              </Text>
            </View>
            <View style={styles.playStyleItem}>
              <View style={[styles.playStyleValueContainer, { backgroundColor: theme.colors.secondary + '10' }]}>
                <Text style={[styles.playStyleValue, { color: theme.colors.secondary }]}>
                  {playStyle.favoriteOp}
                </Text>
              </View>
              <Text style={[styles.playStyleLabel, { color: theme.colors.textMuted }]}>
                Favorite ({playStyle.favoriteOpPercent}%)
              </Text>
            </View>
            <View style={styles.playStyleItem}>
              <View style={[styles.playStyleValueContainer, { backgroundColor: theme.colors.success + '10' }]}>
                <Text style={[styles.playStyleValue, { color: theme.colors.success }]}>
                  {playStyle.perfectSolves}
                </Text>
              </View>
              <Text style={[styles.playStyleLabel, { color: theme.colors.textMuted }]}>
                Perfect Solves
              </Text>
            </View>
          </View>
        </StatCard>
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
    marginBottom: 28,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 22,
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
  card: {
    padding: 24,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overviewStat: {
    alignItems: 'center',
    flex: 1,
  },
  overviewIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  overviewIcon: {
    fontSize: 26,
  },
  overviewValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  overviewLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  overviewDivider: {
    width: 1,
    height: 80,
  },
  difficultyRow: {
    marginBottom: 20,
  },
  difficultyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  difficultyName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  difficultyProgress: {
    fontSize: 14,
    fontWeight: '600',
  },
  starsText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'right',
  },
  endlessRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  endlessStat: {
    alignItems: 'center',
    flex: 1,
  },
  endlessValueContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  endlessValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  endlessLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  playStyleGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  playStyleItem: {
    alignItems: 'center',
    flex: 1,
  },
  playStyleValueContainer: {
    width: 72,
    height: 72,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  playStyleValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  playStyleLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
