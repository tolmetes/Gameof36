// src/data/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PROGRESS: '@game36_progress',
  STREAKS: '@game36_streaks',
  STATS: '@game36_stats',
  SETTINGS: '@game36_settings',
};

// Default data structures
const DEFAULT_PROGRESS = {
  campaign: {
    easy: {}, // { 1: { stars: 3, bestTime: 12, bestMoves: 3 }, ... }
    medium: {},
    hard: {},
  },
  endless: {
    bestRun: 0,
    totalSolved: 0,
  },
};

const DEFAULT_STREAKS = {
  daily: 0,
  lastPlayDate: null,
  solve: 0,
  freezesAvailable: 0,
};

const DEFAULT_STATS = {
  totalPuzzlesSolved: 0,
  totalStarsEarned: 0,
  totalTimePlayed: 0,
  operatorUsage: { '+': 0, '-': 0, '*': 0, '/': 0 },
  perfectSolves: 0,
};

const DEFAULT_SETTINGS = {
  tutorialCompleted: false,
  soundEnabled: true,
  hapticEnabled: true,
};

// Helper to get with default
async function getWithDefault(key, defaultValue) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.warn(`Failed to get ${key}:`, error);
    return defaultValue;
  }
}

// Helper to save
async function save(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save ${key}:`, error);
  }
}

// Progress
export async function getProgress() {
  return getWithDefault(KEYS.PROGRESS, DEFAULT_PROGRESS);
}

export async function saveProgress(progress) {
  await save(KEYS.PROGRESS, progress);
}

export async function updateLevelProgress(difficulty, level, result) {
  const progress = await getProgress();
  const current = progress.campaign[difficulty][level] || {};

  // Only update if better
  const newStars = Math.max(current.stars || 0, result.stars);
  const newBestTime = current.bestTime
    ? Math.min(current.bestTime, result.time)
    : result.time;
  const newBestMoves = current.bestMoves
    ? Math.min(current.bestMoves, result.moves)
    : result.moves;

  progress.campaign[difficulty][level] = {
    stars: newStars,
    bestTime: newBestTime,
    bestMoves: newBestMoves,
    completed: true,
  };

  await saveProgress(progress);
  return progress;
}

// Streaks
export async function getStreaks() {
  return getWithDefault(KEYS.STREAKS, DEFAULT_STREAKS);
}

export async function updateDailyStreak() {
  const streaks = await getStreaks();
  const today = new Date().toDateString();
  const lastPlay = streaks.lastPlayDate;

  if (lastPlay === today) {
    // Already played today
    return streaks;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastPlay === yesterday.toDateString()) {
    // Consecutive day
    streaks.daily += 1;
  } else if (lastPlay !== today) {
    // Streak broken (unless using freeze)
    if (streaks.freezesAvailable > 0) {
      streaks.freezesAvailable -= 1;
    } else {
      streaks.daily = 1;
    }
  }

  streaks.lastPlayDate = today;
  await save(KEYS.STREAKS, streaks);
  return streaks;
}

export async function incrementSolveStreak() {
  const streaks = await getStreaks();
  streaks.solve += 1;
  await save(KEYS.STREAKS, streaks);
  return streaks;
}

export async function resetSolveStreak() {
  const streaks = await getStreaks();
  streaks.solve = 0;
  await save(KEYS.STREAKS, streaks);
  return streaks;
}

// Stats
export async function getStats() {
  return getWithDefault(KEYS.STATS, DEFAULT_STATS);
}

export async function updateStats(result) {
  const stats = await getStats();

  stats.totalPuzzlesSolved += 1;
  stats.totalStarsEarned += result.stars;
  stats.totalTimePlayed += result.time;

  if (result.stars === 3) {
    stats.perfectSolves += 1;
  }

  // Track operator usage
  if (result.operatorsUsed) {
    for (const op of result.operatorsUsed) {
      stats.operatorUsage[op] = (stats.operatorUsage[op] || 0) + 1;
    }
  }

  await save(KEYS.STATS, stats);
  return stats;
}

// Settings
export async function getSettings() {
  return getWithDefault(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export async function updateSettings(updates) {
  const settings = await getSettings();
  const newSettings = { ...settings, ...updates };
  await save(KEYS.SETTINGS, newSettings);
  return newSettings;
}

// Computed helpers
export async function getCompletedLevelsCount(difficulty) {
  const progress = await getProgress();
  return Object.keys(progress.campaign[difficulty]).length;
}

export async function getTotalStars(difficulty) {
  const progress = await getProgress();
  const levels = progress.campaign[difficulty];
  return Object.values(levels).reduce((sum, l) => sum + (l.stars || 0), 0);
}

export async function isWorldUnlocked(difficulty) {
  const progress = await getProgress();

  switch (difficulty) {
    case 'easy':
      return true;
    case 'medium':
      return Object.keys(progress.campaign.easy).length >= 16;
    case 'hard':
      return Object.keys(progress.campaign.medium).length >= 16;
    default:
      return false;
  }
}

// Clear all data (for testing/reset)
export async function clearAllData() {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
