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
