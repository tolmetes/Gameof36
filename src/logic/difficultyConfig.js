// src/logic/difficultyConfig.js
export const DIFFICULTIES = {
  easy: {
    name: 'Easy',
    operators: ['+', '-'],
    numberRange: { min: 2, max: 15 },
    allowMultipleSolutions: true,
    color: 'easy',
    totalLevels: 20,
    unlockRequirement: 0, // Available from start
  },
  medium: {
    name: 'Medium',
    operators: ['+', '-', '*'],
    numberRange: { min: 3, max: 18 },
    allowMultipleSolutions: true, // 2-3 paths
    color: 'medium',
    totalLevels: 20,
    unlockRequirement: 16, // 80% of Easy
  },
  hard: {
    name: 'Hard',
    operators: ['+', '-', '*', '/'],
    numberRange: { min: 4, max: 25 },
    allowMultipleSolutions: false, // Single path
    color: 'hard',
    totalLevels: 15,
    unlockRequirement: 16, // 80% of Medium
  },
};

export const STAR_THRESHOLDS = {
  // Time thresholds in seconds
  twoStar: {
    easy: 20,
    medium: 35,
    hard: 50,
  },
  threeStar: {
    easy: 10,
    medium: 18,
    hard: 30,
  },
};

export const TARGET_NUMBER = 36;
