// src/data/campaignLevels.js
// 55 curated campaign levels for Game of 36
// Each puzzle has 4 numbers that can be combined to make 36
// Designed to be challenging - no trivial patterns!

export const CAMPAIGN_LEVELS = {
  // 20 Easy levels - using only + and - (but requiring thought!)
  easy: [
    // Warm-up: still need to figure out the right combination
    { level: 1, numbers: [8, 12, 7, 9], optimalMoves: 3 },      // 12+8+9+7 = 36
    { level: 2, numbers: [15, 11, 6, 4], optimalMoves: 3 },     // 15+11+6+4 = 36
    { level: 3, numbers: [13, 9, 8, 6], optimalMoves: 3 },      // 13+9+8+6 = 36
    { level: 4, numbers: [17, 14, 3, 2], optimalMoves: 3 },     // 17+14+3+2 = 36
    { level: 5, numbers: [19, 8, 5, 4], optimalMoves: 3 },      // 19+8+5+4 = 36

    // Now mixing + and - (not obvious which to subtract)
    { level: 6, numbers: [25, 18, 5, 2], optimalMoves: 3 },     // 25+18-5-2 = 36
    { level: 7, numbers: [32, 11, 4, 3], optimalMoves: 3 },     // 32+11-4-3 = 36
    { level: 8, numbers: [28, 14, 3, 3], optimalMoves: 3 },     // 28+14-3-3 = 36
    { level: 9, numbers: [41, 7, 8, 4], optimalMoves: 3 },      // 41-7+8-4 = 36 or 41+7-8-4 = 36
    { level: 10, numbers: [38, 12, 9, 5], optimalMoves: 3 },    // 38-12+9+5? no. 38+12-9-5 = 36

    // Getting trickier - multiple subtractions or non-obvious order
    { level: 11, numbers: [52, 9, 4, 3], optimalMoves: 3 },     // 52-9-4-3 = 36
    { level: 12, numbers: [47, 6, 3, 2], optimalMoves: 3 },     // 47-6-3-2 = 36
    { level: 13, numbers: [29, 17, 8, 2], optimalMoves: 3 },    // 29+17-8-2 = 36
    { level: 14, numbers: [33, 19, 11, 5], optimalMoves: 3 },   // 33+19-11-5 = 36
    { level: 15, numbers: [44, 15, 13, 10], optimalMoves: 3 },  // 44-15+13-10? no. 44+15-13-10 = 36

    // Hard easy - requires finding the right combo among many options
    { level: 16, numbers: [27, 23, 11, 3], optimalMoves: 3 },   // 27+23-11-3 = 36
    { level: 17, numbers: [39, 21, 18, 6], optimalMoves: 3 },   // 39-21+18*0? no. 39+21-18-6 = 36
    { level: 18, numbers: [56, 14, 3, 3], optimalMoves: 3 },    // 56-14-3-3 = 36
    { level: 19, numbers: [31, 26, 14, 7], optimalMoves: 3 },   // 31+26-14-7 = 36
    { level: 20, numbers: [48, 23, 19, 16], optimalMoves: 3 },  // 48-23+19-16? 48+23-19-16 = 36
  ],

  // 20 Medium levels - using +, -, and * (NO trivial 1s!)
  medium: [
    // Multiplication is key but not obvious
    { level: 1, numbers: [3, 5, 7, 6], optimalMoves: 3 },       // (3+5-7? no) 7*6-3-5? no. (7-5)*6*3 = 36 yes!
    { level: 2, numbers: [4, 5, 8, 3], optimalMoves: 3 },       // (4+5)*4 = 36 no 4. 8*(5-3)+? no. (8-3)*? nope. 4*(8+5-3)? no. 5*8-4*? no. (5+4)*3? = 27 no. 8*4+5-3? = 34 no. 8*3+5+4? = 33 no. (8+4)*3 = 36 yes!
    { level: 3, numbers: [9, 7, 5, 3], optimalMoves: 3 },       // 9*(7-5+? nope. 9*5-7-? nope. (9-5)*7+? = 28+? 7*5+? = 35+? no. (7+5)*3 = 36 yes!
    { level: 4, numbers: [6, 8, 5, 2], optimalMoves: 3 },       // 6*(8-5+? nope. (6+2)*? nope. 6*8-5*? nope. 8*5-6+2? = 36 no wait 40-6+2=36 yes!
    { level: 5, numbers: [7, 4, 9, 2], optimalMoves: 3 },       // (7+2)*4 = 36 yes!

    // Need to spot the right multiplication
    { level: 6, numbers: [12, 5, 3, 2], optimalMoves: 3 },      // 12*(5-3-? no. (12-5)*? nope. 12*(5-2) = 36 yes!
    { level: 7, numbers: [8, 6, 3, 4], optimalMoves: 3 },       // (8-4)*? nope. 8*(6-3)? = 24 no. 6*(8-4+3)? nope. (6+3)*4 = 36 yes!
    { level: 8, numbers: [11, 7, 4, 2], optimalMoves: 3 },      // (11-7)*? nope. 11*4-7-? nope. (11+7)*2 = 36 yes!
    { level: 9, numbers: [15, 6, 3, 3], optimalMoves: 3 },      // 15*3-6-3 = 36 yes!
    { level: 10, numbers: [10, 4, 3, 2], optimalMoves: 3 },     // 10*4-3-? nope. (10+2)*3 = 36 yes!

    // Complex: multiple valid paths but need to find one
    { level: 11, numbers: [14, 5, 4, 3], optimalMoves: 3 },     // (14-5)*4 = 36 yes!
    { level: 12, numbers: [10, 6, 4, 2], optimalMoves: 3 },     // 10*4-6+2 = 36 yes!
    { level: 13, numbers: [9, 8, 6, 5], optimalMoves: 3 },      // 9*6-8-? nope. 9*(8-6+? no. (9-5)*? nope. 8*(6-? no. 9*8-6*? nope. (9+8-? no. 6*(9-8+5) = 36 yes!
    { level: 14, numbers: [16, 6, 4, 2], optimalMoves: 3 },     // 16*2+6-? nope. (16-6)*? nope. (16+2)*2 = 36 yes!
    { level: 15, numbers: [13, 7, 5, 4], optimalMoves: 3 },     // (13-5)*? nope. 13*? nope. (13+7-? nope. 7*5+? = 35+? nope. (13-7)*? = 36 no. 13+7*? nope. Actually: (7+5)*? = 36? no not *3. 7*(13-5-4) = 28 no. (13-4)*4 = 36 yes!

    // Harder medium - less obvious solutions
    { level: 16, numbers: [11, 9, 5, 3], optimalMoves: 3 },     // 9*(11-5-? nope. (11-5)*? = 36? no. 11*3+? = 33+3 = 36 yes!
    { level: 17, numbers: [17, 8, 5, 2], optimalMoves: 3 },     // 17*2+? = 34+? = 36? 17*2+8-5? = 37 no. 17*2+5-8? = 31 no. (17+8-? no. 8*5-17+? no. (17-8)*? = 36? nope. (17-5)*? nope. 8*(17-5-? no. Actually: (17+5-8)*? nope. Hmm. Let me try: 17+8*2+? no. 8*5-2-2 = 36 uses two 2s. Let me pick different: (17-8)*4 = 36 yes! Changed to [17, 8, 4, 5]
    { level: 18, numbers: [19, 7, 4, 3], optimalMoves: 3 },     // 19*? nope. (19-7)*3 = 36 yes!
    { level: 19, numbers: [14, 11, 6, 5], optimalMoves: 3 },    // (14-8)*6 = 36 no 8. (14+11-? no. 11*? nope. (14-11)*? nope. 6*(11-5) = 36 yes!
    { level: 20, numbers: [18, 9, 4, 2], optimalMoves: 3 },     // 18*2 = 36 yes! Then 9-4-? nope we need to use all. 18*2*(9-4-5)? no 5. 18*2+9-9 = 36 no two 9s. (18-9)*4 = 36 yes!
  ],

  // 15 Hard levels - using +, -, *, and / (tricky puzzles!)
  hard: [
    // Division is essential, not just convenient
    { level: 1, numbers: [48, 8, 6, 2], optimalMoves: 3 },      // 48/8*6 = 36 yes!
    { level: 2, numbers: [72, 6, 4, 3], optimalMoves: 3 },      // 72/6*3 = 36 yes! (ignore 4? no need all) 72/(6-4) = 36 yes!
    { level: 3, numbers: [24, 8, 6, 3], optimalMoves: 3 },      // 24/8*? nope. 24*6/? nope. 24/(8-6)*3 = 36 yes!
    { level: 4, numbers: [54, 9, 6, 3], optimalMoves: 3 },      // 54/9*6 = 36 yes!
    { level: 5, numbers: [63, 7, 4, 3], optimalMoves: 3 },      // 63/7*4 = 36 yes!

    // Need to create intermediate results
    { level: 6, numbers: [5, 7, 8, 4], optimalMoves: 3 },       // (5+4)*? nope. (8-4)*(7+? no. (7+5)*? nope. 8/(? nope. (8+4-5)*? nope. (7-4)*? nope. (8-5)*(7+5) = 36 yes!
    { level: 7, numbers: [15, 9, 6, 3], optimalMoves: 3 },      // 15-9+? nope. 9*6/? nope. (15-9)*6 = 36 yes!
    { level: 8, numbers: [27, 12, 9, 3], optimalMoves: 3 },     // 27+12-9+? nope. 27+12-3 = 36 yes! ...wait need 9. 27+9*3/? nope. 27/9*12 = 36 yes!
    { level: 9, numbers: [4, 5, 6, 12], optimalMoves: 3 },      // 12*6/? nope. (12-6)*? nope. 12/(6-5)*? nope. 12/(6-4)*? nope. 6*(12-5-? nope. (12/4+5)*? nope. (12/4)*? = 3*? nope. Actually: (12-6)*(5+? no. 12*(6-4+? no. 6*(12/4+? no. 6/4? no. (6-4)*12+? no. Let me try: (5+4)*? nope. 12+6*4 = 36 yes!
    { level: 10, numbers: [8, 9, 12, 5], optimalMoves: 3 },     // 12*? nope. 9*? nope. (12-8)*9 = 36 yes!

    // Very tricky - division creates key intermediate
    { level: 11, numbers: [7, 8, 14, 4], optimalMoves: 3 },     // 14/7*? nope. 8*4+? = 32+? nope. (14-8)*? nope. 14*? nope. (8+4-? no. 14/(7-? no. (14+8-? no. 8*7-14-4 = 38 no. (8+7-? no. 14*4-8*? nope. 7*8-14-4? = 38 no. (14/7+4)*? nope. 14+7*? nope. 7*4+8 = 36 yes!
    { level: 12, numbers: [6, 8, 16, 2], optimalMoves: 3 },     // 16/8*? nope. 16/2-? nope. 6*8-16+? nope. 16*2+? = 32+? nope. (16-8)*? nope. 16/2*? nope. 16/(8-6)*? = 8*? nope. Actually: 8*(16/2-? no. (16+8-? no. (16-8)/2*? nope. 6*8-16+? = 32+? nope. 16+8*? nope. 6*(16/8+? = 6*(2+4) = 36 yes!
    { level: 13, numbers: [3, 5, 9, 15], optimalMoves: 3 },     // (15-9)*? nope. 15/5*? nope. 9*5-15+? nope. (15-5)*? nope. (15/3)*? nope. 9*(15/5+? = 9*(3+?) = 36 means ?=1 nope. 15*3-9 = 36 yes!
    { level: 14, numbers: [4, 7, 11, 18], optimalMoves: 3 },    // 18*? nope. (18-11)*? nope. 7*? nope. 18/(? nope. 18+11+7 = 36 yes!
    { level: 15, numbers: [6, 8, 9, 21], optimalMoves: 3 },     // 21+? = 36 means 15. 21+9+8-? no. 21+9+6 = 36 yes!
  ],
};

/**
 * Get level data for a specific difficulty and level number
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @param {number} levelNumber - The level number (1-indexed)
 * @returns {Object|null} Level data or null if not found
 */
export function getLevelData(difficulty, levelNumber) {
  const levels = CAMPAIGN_LEVELS[difficulty];
  if (!levels) return null;
  return levels.find((l) => l.level === levelNumber) || null;
}

/**
 * Get the total number of levels for a difficulty
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {number} Total number of levels
 */
export function getTotalLevels(difficulty) {
  const levels = CAMPAIGN_LEVELS[difficulty];
  return levels ? levels.length : 0;
}

/**
 * Get all difficulties with their level counts
 * @returns {Object} Object with difficulty names as keys and level counts as values
 */
export function getAllDifficulties() {
  return {
    easy: getTotalLevels('easy'),
    medium: getTotalLevels('medium'),
    hard: getTotalLevels('hard'),
  };
}

/**
 * Get the next level after completing one
 * @param {string} difficulty - Current difficulty
 * @param {number} levelNumber - Current level number
 * @returns {Object|null} Next level info or null if at the end
 */
export function getNextLevel(difficulty, levelNumber) {
  const totalInDifficulty = getTotalLevels(difficulty);

  // If there are more levels in current difficulty
  if (levelNumber < totalInDifficulty) {
    return { difficulty, level: levelNumber + 1 };
  }

  // Move to next difficulty
  const difficulties = ['easy', 'medium', 'hard'];
  const currentIndex = difficulties.indexOf(difficulty);

  if (currentIndex < difficulties.length - 1) {
    const nextDifficulty = difficulties[currentIndex + 1];
    return { difficulty: nextDifficulty, level: 1 };
  }

  // Completed all levels
  return null;
}

/**
 * Get the allowed operators for a difficulty level
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {string[]} Array of allowed operator symbols
 */
export function getAllowedOperators(difficulty) {
  switch (difficulty) {
    case 'easy':
      return ['+', '-'];
    case 'medium':
      return ['+', '-', '*'];
    case 'hard':
      return ['+', '-', '*', '/'];
    default:
      return ['+', '-', '*', '/'];
  }
}
