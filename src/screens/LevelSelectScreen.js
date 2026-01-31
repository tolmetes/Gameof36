// src/screens/LevelSelectScreen.js
import React, { useState, useCallback } from 'react';
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
import { getProgress } from '../data/storage';
import { DIFFICULTIES } from '../logic/difficultyConfig';
import { StarRating } from '../components';

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 4;
const GRID_PADDING = 24;
const GRID_GAP = 12;
const BUTTON_SIZE = (width - GRID_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

function LevelButton({ level, stars, isUnlocked, onPress, theme, accentColor }) {
  return (
    <TouchableOpacity
      style={[
        styles.levelButton,
        {
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          opacity: isUnlocked ? 1 : 0.4,
        },
        stars > 0 && {
          borderWidth: 2,
          borderColor: accentColor,
        },
      ]}
      onPress={onPress}
      disabled={!isUnlocked}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.levelNumber,
          {
            color: isUnlocked ? theme.colors.text : theme.colors.textMuted,
          },
        ]}
      >
        {level}
      </Text>
      {isUnlocked && stars > 0 && (
        <View style={styles.levelStars}>
          <StarRating stars={stars} size="small" />
        </View>
      )}
      {!isUnlocked && (
        <Text style={[styles.lockIcon, { color: theme.colors.textMuted }]}>
          &#x1F512;
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function LevelSelectScreen({ navigation, route }) {
  const { difficulty } = route.params;
  const { theme } = useTheme();
  const config = DIFFICULTIES[difficulty];
  const accentColor = theme.colors[config.color];

  const [levelData, setLevelData] = useState({});

  const loadData = useCallback(async () => {
    try {
      const progress = await getProgress();
      setLevelData(progress.campaign[difficulty] || {});
    } catch (error) {
      console.warn('Failed to load level data:', error);
    }
  }, [difficulty]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const getHighestUnlockedLevel = () => {
    const completed = Object.keys(levelData)
      .map(Number)
      .sort((a, b) => b - a);
    if (completed.length === 0) return 1;
    return Math.min(completed[0] + 1, config.totalLevels);
  };

  const highestUnlocked = getHighestUnlockedLevel();

  const renderLevels = () => {
    const levels = [];
    for (let i = 1; i <= config.totalLevels; i++) {
      const data = levelData[i];
      const isUnlocked = i <= highestUnlocked;
      levels.push(
        <LevelButton
          key={i}
          level={i}
          stars={data?.stars || 0}
          isUnlocked={isUnlocked}
          onPress={() =>
            navigation.navigate('Game', {
              difficulty,
              level: i,
            })
          }
          theme={theme}
          accentColor={accentColor}
        />
      );
    }
    return levels;
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
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: accentColor }]}>
            {config.name}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            {Object.keys(levelData).length}/{config.totalLevels} completed
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {renderLevels()}
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
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  placeholder: {
    width: 44,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: GRID_PADDING,
    paddingBottom: 32,
    gap: GRID_GAP,
  },
  levelButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  levelStars: {
    position: 'absolute',
    bottom: 6,
  },
  lockIcon: {
    fontSize: 12,
    marginTop: 4,
  },
});
