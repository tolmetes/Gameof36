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
