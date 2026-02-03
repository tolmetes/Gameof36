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

// Fallback puzzles for each difficulty - designed to be challenging
const FALLBACK_PUZZLES = {
  easy: [
    { numbers: [13, 9, 8, 6], optimalMoves: 3 },   // 13+9+8+6 = 36
    { numbers: [32, 11, 4, 3], optimalMoves: 3 },  // 32+11-4-3 = 36
    { numbers: [47, 6, 3, 2], optimalMoves: 3 },   // 47-6-3-2 = 36
  ],
  medium: [
    { numbers: [14, 5, 4, 3], optimalMoves: 3 },   // (14-5)*4 = 36
    { numbers: [12, 5, 3, 2], optimalMoves: 3 },   // 12*(5-2) = 36
    { numbers: [8, 6, 3, 4], optimalMoves: 3 },    // (6+3)*4 = 36
  ],
  hard: [
    { numbers: [48, 8, 6, 2], optimalMoves: 3 },   // 48/8*6 = 36
    { numbers: [15, 9, 6, 3], optimalMoves: 3 },   // (15-9)*6 = 36
    { numbers: [4, 5, 6, 12], optimalMoves: 3 },   // 12+6*4 = 36
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
