# Game of 36 Revamp - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Game of 36 prototype into a polished mobile game with dual themes, smart puzzle generation, progression system, and engaging UX.

**Architecture:** React Native + Expo app with React Navigation for screen management, React Context for theming and state, AsyncStorage for persistence, and a reverse-generation algorithm for puzzles.

**Tech Stack:** Expo SDK (upgrade from 42), React Navigation 6, React Native Reanimated 3, expo-linear-gradient, AsyncStorage.

**Worktree:** `.worktrees/revamp` on branch `feature/revamp`

---

## Phase 1: Foundation Setup

### Task 1.1: Upgrade Expo and Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Upgrade Expo SDK**

```bash
cd .worktrees/revamp
npx expo install expo@latest
```

**Step 2: Install new dependencies**

```bash
npx expo install @react-navigation/native @react-navigation/stack react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated expo-linear-gradient @react-native-async-storage/async-storage
```

**Step 3: Verify installation**

```bash
npx expo start --web
```

Expected: App loads without errors (may show old UI, that's fine)

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: upgrade Expo and add navigation/animation dependencies"
```

---

### Task 1.2: Create Project Structure

**Files:**
- Create: `src/` directory structure

**Step 1: Create folder structure**

```bash
mkdir -p src/components src/screens src/themes src/logic src/data src/navigation
```

**Step 2: Create placeholder files**

```bash
touch src/themes/dark.js src/themes/playful.js src/themes/ThemeContext.js
touch src/logic/puzzleGenerator.js src/logic/difficultyConfig.js src/logic/starCalculator.js
touch src/data/storage.js src/data/campaignLevels.js
touch src/navigation/AppNavigator.js
```

**Step 3: Commit**

```bash
git add src/
git commit -m "chore: create src folder structure for revamp"
```

---

## Phase 2: Theme System

### Task 2.1: Create Dark Theme

**Files:**
- Create: `src/themes/dark.js`

**Step 1: Write dark theme tokens**

```javascript
// src/themes/dark.js
export const darkTheme = {
  name: 'dark',
  colors: {
    background: ['#0D0D0F', '#1A1A2E'], // gradient
    surface: '#1F1F2E',
    surfaceLight: '#2A2A3E',
    primary: '#00F5FF',
    secondary: '#8B5CF6',
    success: '#00FF88',
    error: '#FF4444',
    text: '#FFFFFF',
    textMuted: '#6B7280',
    textDark: '#1F2937',
    // World accent colors
    easy: '#00F5FF',
    medium: '#8B5CF6',
    hard: '#FF006E',
  },
  typography: {
    fontFamily: 'System', // Will use SF Pro on iOS, Roboto on Android
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
      display: 48,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    glow: {
      shadowColor: '#00F5FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 5,
    },
  },
};
```

**Step 2: Commit**

```bash
git add src/themes/dark.js
git commit -m "feat: add dark theme tokens"
```

---

### Task 2.2: Create Playful Theme

**Files:**
- Create: `src/themes/playful.js`

**Step 1: Write playful theme tokens**

```javascript
// src/themes/playful.js
export const playfulTheme = {
  name: 'playful',
  colors: {
    background: ['#667EEA', '#F093FB'], // gradient
    surface: '#FFFFFF',
    surfaceLight: '#F3F4F6',
    primary: '#FBBF24',
    secondary: '#7C3AED',
    success: '#34D399',
    error: '#EF4444',
    text: '#1F2937',
    textMuted: '#6B7280',
    textDark: '#1F2937',
    // World accent colors
    easy: '#34D399',
    medium: '#FBBF24',
    hard: '#EF4444',
  },
  typography: {
    fontFamily: 'System',
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
      display: 48,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};
```

**Step 2: Commit**

```bash
git add src/themes/playful.js
git commit -m "feat: add playful theme tokens"
```

---

### Task 2.3: Create Theme Context

**Files:**
- Create: `src/themes/ThemeContext.js`

**Step 1: Write theme context with persistence**

```javascript
// src/themes/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme } from './dark';
import { playfulTheme } from './playful';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = '@game36_theme';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(darkTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'playful') {
        setTheme(playfulTheme);
      } else {
        setTheme(darkTheme);
      }
    } catch (error) {
      console.warn('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme.name === 'dark' ? playfulTheme : darkTheme;
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme.name);
    } catch (error) {
      console.warn('Failed to save theme:', error);
    }
  };

  const value = {
    theme,
    isDark: theme.name === 'dark',
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

**Step 2: Commit**

```bash
git add src/themes/ThemeContext.js
git commit -m "feat: add theme context with persistence"
```

---

## Phase 3: Core Logic

### Task 3.1: Create Difficulty Configuration

**Files:**
- Create: `src/logic/difficultyConfig.js`

**Step 1: Write difficulty configuration**

```javascript
// src/logic/difficultyConfig.js
export const DIFFICULTIES = {
  easy: {
    name: 'Easy',
    operators: ['+', '-'],
    numberRange: { min: 1, max: 12 },
    allowMultipleSolutions: true,
    color: 'easy',
    totalLevels: 20,
    unlockRequirement: 0, // Available from start
  },
  medium: {
    name: 'Medium',
    operators: ['+', '-', '*'],
    numberRange: { min: 1, max: 15 },
    allowMultipleSolutions: true, // 2-3 paths
    color: 'medium',
    totalLevels: 20,
    unlockRequirement: 16, // 80% of Easy
  },
  hard: {
    name: 'Hard',
    operators: ['+', '-', '*', '/'],
    numberRange: { min: 1, max: 20 },
    allowMultipleSolutions: false, // Single path
    color: 'hard',
    totalLevels: 15,
    unlockRequirement: 16, // 80% of Medium
  },
};

export const STAR_THRESHOLDS = {
  // Time thresholds in seconds
  twoStar: {
    easy: 30,
    medium: 45,
    hard: 60,
  },
  threeStar: {
    easy: 15,
    medium: 25,
    hard: 40,
  },
};

export const TARGET_NUMBER = 36;
```

**Step 2: Commit**

```bash
git add src/logic/difficultyConfig.js
git commit -m "feat: add difficulty configuration"
```

---

### Task 3.2: Create Puzzle Generator

**Files:**
- Create: `src/logic/puzzleGenerator.js`

**Step 1: Write reverse generation algorithm**

```javascript
// src/logic/puzzleGenerator.js
import { DIFFICULTIES, TARGET_NUMBER } from './difficultyConfig';

/**
 * Generates a puzzle by working backwards from 36.
 * Returns { numbers: [a, b, c, d], solution: [...steps], optimalMoves: n }
 */
export function generatePuzzle(difficulty = 'easy') {
  const config = DIFFICULTIES[difficulty];
  const { operators, numberRange } = config;

  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    attempts++;
    const result = tryGeneratePuzzle(TARGET_NUMBER, operators, numberRange);
    if (result && result.numbers.length === 4) {
      // Validate all numbers are in range
      const allInRange = result.numbers.every(
        n => n >= numberRange.min && n <= numberRange.max && Number.isInteger(n)
      );
      if (allInRange) {
        return {
          numbers: shuffleArray(result.numbers),
          solution: result.solution,
          optimalMoves: result.solution.length,
          difficulty,
        };
      }
    }
  }

  // Fallback to pre-defined puzzle if generation fails
  return getFallbackPuzzle(difficulty);
}

function tryGeneratePuzzle(target, operators, numberRange, depth = 0) {
  // Base case: if depth is 3, we need exactly one number
  if (depth >= 3) {
    if (target >= numberRange.min && target <= numberRange.max && Number.isInteger(target)) {
      return { numbers: [target], solution: [] };
    }
    return null;
  }

  // Try splitting the target using random operators
  const shuffledOps = shuffleArray([...operators]);

  for (const op of shuffledOps) {
    const splits = getSplits(target, op, numberRange);
    const shuffledSplits = shuffleArray(splits);

    for (const [a, b] of shuffledSplits) {
      // Decide how to split the tree
      const leftDepth = Math.random() > 0.5 ? 1 : 2;
      const rightDepth = 3 - depth - leftDepth;

      if (leftDepth > 0 && rightDepth >= 0) {
        const leftResult = tryGeneratePuzzle(a, operators, numberRange, depth + (3 - leftDepth));
        if (leftResult) {
          if (rightDepth === 0) {
            if (b >= numberRange.min && b <= numberRange.max && Number.isInteger(b)) {
              return {
                numbers: [...leftResult.numbers, b],
                solution: [...leftResult.solution, { op, operands: [a, b], result: target }],
              };
            }
          } else {
            const rightResult = tryGeneratePuzzle(b, operators, numberRange, depth + (3 - rightDepth));
            if (rightResult) {
              return {
                numbers: [...leftResult.numbers, ...rightResult.numbers],
                solution: [...leftResult.solution, ...rightResult.solution, { op, operands: [a, b], result: target }],
              };
            }
          }
        }
      }
    }
  }

  return null;
}

function getSplits(target, operator, numberRange) {
  const splits = [];
  const { min, max } = numberRange;

  switch (operator) {
    case '+':
      // target = a + b
      for (let a = min; a <= Math.min(max, target - min); a++) {
        const b = target - a;
        if (b >= min && b <= max) {
          splits.push([a, b]);
        }
      }
      break;

    case '-':
      // target = a - b
      for (let b = min; b <= max; b++) {
        const a = target + b;
        if (a >= min && a <= max) {
          splits.push([a, b]);
        }
      }
      break;

    case '*':
      // target = a * b
      for (let a = min; a <= max; a++) {
        if (target % a === 0) {
          const b = target / a;
          if (b >= min && b <= max && Number.isInteger(b)) {
            splits.push([a, b]);
          }
        }
      }
      break;

    case '/':
      // target = a / b
      for (let b = min; b <= max; b++) {
        const a = target * b;
        if (a >= min && a <= max) {
          splits.push([a, b]);
        }
      }
      break;
  }

  return splits;
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Fallback puzzles for each difficulty
const FALLBACK_PUZZLES = {
  easy: [
    { numbers: [9, 9, 9, 9], optimalMoves: 3 }, // 9+9+9+9 = 36
    { numbers: [6, 6, 12, 12], optimalMoves: 3 }, // 12+12+6+6 = 36
    { numbers: [10, 10, 8, 8], optimalMoves: 3 }, // 10+10+8+8 = 36
  ],
  medium: [
    { numbers: [2, 3, 4, 6], optimalMoves: 3 }, // (2+4)*6 = 36 or 2*3*6 = 36
    { numbers: [3, 3, 4, 4], optimalMoves: 3 }, // (3+3)*(4+4)/2... many solutions
    { numbers: [2, 2, 9, 9], optimalMoves: 3 }, // 2*9+2*9 = 36
  ],
  hard: [
    { numbers: [1, 5, 7, 9], optimalMoves: 3 }, // (1+5)*(9-7+1)... tricky
    { numbers: [2, 3, 6, 8], optimalMoves: 3 }, // 8/(2-6/3) or (8-2)*6
    { numbers: [1, 4, 6, 9], optimalMoves: 3 }, // 4*(9-1)+6/6... requires thought
  ],
};

function getFallbackPuzzle(difficulty) {
  const puzzles = FALLBACK_PUZZLES[difficulty] || FALLBACK_PUZZLES.easy;
  const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
  return {
    numbers: shuffleArray([...puzzle.numbers]),
    solution: [],
    optimalMoves: puzzle.optimalMoves,
    difficulty,
  };
}

/**
 * Validates if a set of numbers can make 36.
 * Returns all valid solutions.
 */
export function findSolutions(numbers, target = TARGET_NUMBER) {
  const solutions = [];
  findSolutionsRecursive(numbers, [], target, solutions);
  return solutions;
}

function findSolutionsRecursive(numbers, steps, target, solutions) {
  if (numbers.length === 1) {
    if (numbers[0] === target) {
      solutions.push([...steps]);
    }
    return;
  }

  const operators = ['+', '-', '*', '/'];

  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      const a = numbers[i];
      const b = numbers[j];
      const remaining = numbers.filter((_, idx) => idx !== i && idx !== j);

      for (const op of operators) {
        let result;
        switch (op) {
          case '+': result = a + b; break;
          case '-': result = a - b; break;
          case '*': result = a * b; break;
          case '/':
            if (b !== 0 && a % b === 0) result = a / b;
            else continue;
            break;
        }

        if (result !== undefined && result > 0) {
          const step = { a, op, b, result };
          findSolutionsRecursive([...remaining, result], [...steps, step], target, solutions);
        }

        // Try reverse for non-commutative operations
        if (op === '-' || op === '/') {
          let reverseResult;
          switch (op) {
            case '-': reverseResult = b - a; break;
            case '/':
              if (a !== 0 && b % a === 0) reverseResult = b / a;
              else continue;
              break;
          }

          if (reverseResult !== undefined && reverseResult > 0) {
            const step = { a: b, op, b: a, result: reverseResult };
            findSolutionsRecursive([...remaining, reverseResult], [...steps, step], target, solutions);
          }
        }
      }
    }
  }
}
```

**Step 2: Commit**

```bash
git add src/logic/puzzleGenerator.js
git commit -m "feat: add puzzle generator with reverse algorithm"
```

---

### Task 3.3: Create Star Calculator

**Files:**
- Create: `src/logic/starCalculator.js`

**Step 1: Write star calculation logic**

```javascript
// src/logic/starCalculator.js
import { STAR_THRESHOLDS } from './difficultyConfig';

/**
 * Calculate stars earned for a puzzle solve.
 * @param {number} moves - Number of moves taken
 * @param {number} optimalMoves - Optimal number of moves
 * @param {number} timeSeconds - Time taken in seconds
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @returns {number} 1, 2, or 3 stars
 */
export function calculateStars(moves, optimalMoves, timeSeconds, difficulty) {
  const isOptimalMoves = moves <= optimalMoves;
  const thresholds = STAR_THRESHOLDS;

  const underThreeStarTime = timeSeconds <= thresholds.threeStar[difficulty];
  const underTwoStarTime = timeSeconds <= thresholds.twoStar[difficulty];

  // 3 stars: optimal moves AND under time threshold
  if (isOptimalMoves && underThreeStarTime) {
    return 3;
  }

  // 2 stars: optimal moves OR under time threshold
  if (isOptimalMoves || underTwoStarTime) {
    return 2;
  }

  // 1 star: just solved
  return 1;
}

/**
 * Get feedback message based on stars
 */
export function getStarMessage(stars) {
  switch (stars) {
    case 3: return 'Perfect!';
    case 2: return 'Great job!';
    case 1: return 'Solved!';
    default: return '';
  }
}
```

**Step 2: Commit**

```bash
git add src/logic/starCalculator.js
git commit -m "feat: add star rating calculator"
```

---

### Task 3.4: Create Storage Service

**Files:**
- Create: `src/data/storage.js`

**Step 1: Write storage service**

```javascript
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
```

**Step 2: Commit**

```bash
git add src/data/storage.js
git commit -m "feat: add storage service for progress, streaks, stats"
```

---

## Phase 4: Core Components

### Task 4.1: Create NumberCard Component

**Files:**
- Create: `src/components/NumberCard.js`

**Step 1: Write NumberCard component**

```javascript
// src/components/NumberCard.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

export function NumberCard({
  value,
  onPress,
  disabled = false,
  selected = false,
  hidden = false,
  size = 'large'
}) {
  const { theme, isDark } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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

  const sizeStyles = {
    large: { width: 80, height: 80, fontSize: theme.typography.sizes.xxl },
    medium: { width: 64, height: 64, fontSize: theme.typography.sizes.xl },
    small: { width: 48, height: 48, fontSize: theme.typography.sizes.lg },
  };

  const { width, height, fontSize } = sizeStyles[size];

  if (hidden) {
    return (
      <Animated.View
        style={[
          styles.card,
          {
            width,
            height,
            backgroundColor: 'transparent',
            borderColor: theme.colors.textMuted,
            borderWidth: 1,
            borderStyle: 'dashed',
            opacity: 0.3,
          },
        ]}
      >
        <Text style={[styles.number, { color: theme.colors.textMuted, fontSize }]}>
          {value}
        </Text>
      </Animated.View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.card,
          {
            width,
            height,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            transform: [{ scale: scaleAnim }],
          },
          selected && {
            borderColor: theme.colors.primary,
            borderWidth: 3,
            ...(isDark && theme.shadows.glow),
          },
          disabled && {
            opacity: 0.5,
          },
        ]}
      >
        <Text
          style={[
            styles.number,
            {
              color: selected ? theme.colors.primary : theme.colors.text,
              fontSize,
            },
          ]}
        >
          {value}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  number: {
    fontWeight: 'bold',
  },
});
```

**Step 2: Commit**

```bash
git add src/components/NumberCard.js
git commit -m "feat: add NumberCard component with theming"
```

---

### Task 4.2: Create OperatorButton Component

**Files:**
- Create: `src/components/OperatorButton.js`

**Step 1: Write OperatorButton component**

```javascript
// src/components/OperatorButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

const OPERATOR_SYMBOLS = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
};

export function OperatorButton({ operator, onPress, selected = false, disabled = false }) {
  const { theme, isDark } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
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

  const symbol = OPERATOR_SYMBOLS[operator] || operator;

  return (
    <TouchableOpacity
      onPress={() => onPress(operator)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.button,
          {
            borderRadius: theme.borderRadius.full,
            borderColor: theme.colors.primary,
            transform: [{ scale: scaleAnim }],
          },
          selected && {
            backgroundColor: theme.colors.primary,
          },
          !selected && isDark && {
            backgroundColor: 'transparent',
            borderWidth: 2,
          },
          !selected && !isDark && {
            backgroundColor: theme.colors.surface,
            borderWidth: 2,
          },
          disabled && {
            opacity: 0.5,
          },
        ]}
      >
        <Text
          style={[
            styles.symbol,
            {
              color: selected
                ? (isDark ? theme.colors.textDark : theme.colors.surface)
                : theme.colors.primary,
            },
          ]}
        >
          {symbol}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  symbol: {
    fontSize: 28,
    fontWeight: '600',
  },
});
```

**Step 2: Commit**

```bash
git add src/components/OperatorButton.js
git commit -m "feat: add OperatorButton component"
```

---

### Task 4.3: Create StarRating Component

**Files:**
- Create: `src/components/StarRating.js`

**Step 1: Write StarRating component**

```javascript
// src/components/StarRating.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

export function StarRating({ stars, size = 'medium', animated = false }) {
  const { theme } = useTheme();
  const animations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    if (animated) {
      // Stagger star animations
      Animated.stagger(200, [
        Animated.spring(animations[0], {
          toValue: stars >= 1 ? 1 : 0,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.spring(animations[1], {
          toValue: stars >= 2 ? 1 : 0,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.spring(animations[2], {
          toValue: stars >= 3 ? 1 : 0,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      animations.forEach((anim, i) => anim.setValue(stars > i ? 1 : 0));
    }
  }, [stars, animated]);

  const sizes = {
    small: 16,
    medium: 24,
    large: 36,
  };

  const starSize = sizes[size];

  return (
    <View style={styles.container}>
      {[0, 1, 2].map((i) => (
        <Animated.Text
          key={i}
          style={[
            styles.star,
            {
              fontSize: starSize,
              color: theme.colors.secondary,
              opacity: animated ? animations[i] : (stars > i ? 1 : 0.3),
              transform: animated
                ? [{
                    scale: animations[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  }]
                : [],
            },
          ]}
        >
          ★
        </Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 2,
  },
});
```

**Step 2: Commit**

```bash
git add src/components/StarRating.js
git commit -m "feat: add StarRating component with animation"
```

---

### Task 4.4: Create ProgressBar Component

**Files:**
- Create: `src/components/ProgressBar.js`

**Step 1: Write ProgressBar component**

```javascript
// src/components/ProgressBar.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

export function ProgressBar({
  current,
  total,
  label,
  showPercentage = false,
  color,
  animated = true
}) {
  const { theme } = useTheme();
  const widthAnim = useRef(new Animated.Value(0)).current;

  const percentage = total > 0 ? (current / total) * 100 : 0;
  const barColor = color || theme.colors.primary;

  useEffect(() => {
    if (animated) {
      Animated.spring(widthAnim, {
        toValue: percentage,
        friction: 8,
        useNativeDriver: false,
      }).start();
    } else {
      widthAnim.setValue(percentage);
    }
  }, [percentage, animated]);

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {label}
          </Text>
          <Text style={[styles.count, { color: theme.colors.textMuted }]}>
            {current}/{total}
            {showPercentage && ` (${Math.round(percentage)}%)`}
          </Text>
        </View>
      )}
      <View style={[styles.track, { backgroundColor: theme.colors.surfaceLight }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              width: widthAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  count: {
    fontSize: 14,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
```

**Step 2: Commit**

```bash
git add src/components/ProgressBar.js
git commit -m "feat: add ProgressBar component"
```

---

### Task 4.5: Create Button Component

**Files:**
- Create: `src/components/Button.js`

**Step 1: Write Button component**

```javascript
// src/components/Button.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

export function Button({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost'
  size = 'medium', // 'small' | 'medium' | 'large'
  disabled = false,
  fullWidth = false,
  icon,
}) {
  const { theme, isDark } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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

  const sizeStyles = {
    small: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 },
    medium: { paddingVertical: 12, paddingHorizontal: 24, fontSize: 16 },
    large: { paddingVertical: 16, paddingHorizontal: 32, fontSize: 18 },
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          textColor: isDark ? theme.colors.textDark : theme.colors.surface,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.surface,
          textColor: theme.colors.text,
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          textColor: theme.colors.primary,
        };
      default:
        return {};
    }
  };

  const variantStyles = getVariantStyles();
  const { paddingVertical, paddingHorizontal, fontSize } = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: variantStyles.backgroundColor,
            borderRadius: theme.borderRadius.lg,
            paddingVertical,
            paddingHorizontal,
            borderWidth: variantStyles.borderWidth || 0,
            borderColor: variantStyles.borderColor,
            transform: [{ scale: scaleAnim }],
          },
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
        ]}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text
          style={[
            styles.text,
            {
              color: variantStyles.textColor,
              fontSize,
            },
          ]}
        >
          {title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  icon: {
    marginRight: 8,
    fontSize: 18,
  },
});
```

**Step 2: Commit**

```bash
git add src/components/Button.js
git commit -m "feat: add Button component with variants"
```

---

### Task 4.6: Create Modal Component

**Files:**
- Create: `src/components/Modal.js`

**Step 1: Write Modal component**

```javascript
// src/components/Modal.js
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function Modal({ visible, onClose, children }) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.7],
              }),
            },
          ]}
        />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.content,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.xl,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  content: {
    width: '85%',
    maxWidth: 400,
    padding: 24,
    zIndex: 1001,
  },
});
```

**Step 2: Commit**

```bash
git add src/components/Modal.js
git commit -m "feat: add Modal component with animations"
```

---

### Task 4.7: Create Components Index

**Files:**
- Create: `src/components/index.js`

**Step 1: Export all components**

```javascript
// src/components/index.js
export { NumberCard } from './NumberCard';
export { OperatorButton } from './OperatorButton';
export { StarRating } from './StarRating';
export { ProgressBar } from './ProgressBar';
export { Button } from './Button';
export { Modal } from './Modal';
```

**Step 2: Commit**

```bash
git add src/components/index.js
git commit -m "feat: add components index export"
```

---

## Phase 5: Navigation

### Task 5.1: Create App Navigator

**Files:**
- Create: `src/navigation/AppNavigator.js`

**Step 1: Write navigation setup**

```javascript
// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../themes/ThemeContext';

// Import screens (will be created next)
import { SplashScreen } from '../screens/SplashScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { CampaignScreen } from '../screens/CampaignScreen';
import { LevelSelectScreen } from '../screens/LevelSelectScreen';
import { GameScreen } from '../screens/GameScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { EndlessScreen } from '../screens/EndlessScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { TutorialScreen } from '../screens/TutorialScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createStackNavigator();

export function AppNavigator() {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: theme.colors.background[0] },
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Campaign" component={CampaignScreen} />
        <Stack.Screen name="LevelSelect" component={LevelSelectScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Endless" component={EndlessScreen} />
        <Stack.Screen name="Stats" component={StatsScreen} />
        <Stack.Screen name="Tutorial" component={TutorialScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**Step 2: Commit (will complete after screens exist)**

Note: This file will fail to import until screens are created. Proceed to create placeholder screens first.

---

## Phase 6: Screens (Summary)

Due to document length, each screen follows the same pattern:

### Task 6.1-6.10: Create Screens

Create each screen file in `src/screens/`:

1. **SplashScreen.js** - Logo animation, 1.5s delay, navigate to Home or Tutorial
2. **HomeScreen.js** - Menu cards for Campaign/Endless/Stats, settings gear
3. **CampaignScreen.js** - World selection (Easy/Medium/Hard) with progress
4. **LevelSelectScreen.js** - Grid of levels for selected world
5. **GameScreen.js** - Main game logic with NumberCards, Operators, undo
6. **ResultScreen.js** - Stars, time, moves, streak display, Next/Home buttons
7. **EndlessScreen.js** - Continuous puzzle mode with streak tracking
8. **StatsScreen.js** - Progress visualization, play style stats
9. **TutorialScreen.js** - Interactive 9+9+9+9 tutorial with step prompts
10. **SettingsScreen.js** - Theme toggle, sound, tutorial reset

Each screen follows this structure:
- Import `useTheme` for styling
- Use `LinearGradient` for backgrounds
- Implement screen-specific logic
- Commit after each screen

---

## Phase 7: Integration

### Task 7.1: Update App.js Entry Point

**Files:**
- Modify: `App.js`

**Step 1: Wrap app with providers**

```javascript
// App.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/themes/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </ThemeProvider>
  );
}
```

**Step 2: Commit**

```bash
git add App.js
git commit -m "feat: integrate theme provider and navigation"
```

---

## Phase 8: Campaign Levels

### Task 8.1: Generate Campaign Levels

**Files:**
- Create: `src/data/campaignLevels.js`

**Step 1: Generate and curate 55 levels**

Use `generatePuzzle()` to create levels, manually verify, and store as static data for consistent experience.

---

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| 1 | 1.1-1.2 | Setup: Expo upgrade, folder structure |
| 2 | 2.1-2.3 | Themes: Dark, Playful, Context |
| 3 | 3.1-3.4 | Logic: Difficulty, Generator, Stars, Storage |
| 4 | 4.1-4.7 | Components: NumberCard, Operator, Star, Progress, Button, Modal |
| 5 | 5.1 | Navigation: Stack navigator |
| 6 | 6.1-6.10 | Screens: All 10 screens |
| 7 | 7.1 | Integration: App.js entry |
| 8 | 8.1 | Content: Campaign levels |

**Total estimated tasks:** ~25 commits

---

## Execution Notes

- Run in worktree: `.worktrees/revamp`
- Branch: `feature/revamp`
- Test after each phase with `npx expo start`
- Commit frequently with descriptive messages
