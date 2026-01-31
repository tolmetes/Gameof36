// src/screens/GameScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../themes/ThemeContext';
import { NumberCard, OperatorButton, StarRating } from '../components';
import { generatePuzzle } from '../logic/puzzleGenerator';
import { calculateStars } from '../logic/starCalculator';
import { getProgress } from '../data/storage';
import { DIFFICULTIES, TARGET_NUMBER } from '../logic/difficultyConfig';

const OPERATORS = ['+', '-', '*', '/'];

export default function GameScreen({ navigation, route }) {
  const { difficulty, level } = route.params;
  const { theme } = useTheme();
  const config = DIFFICULTIES[difficulty];
  const accentColor = theme.colors[config.color];

  // Game state
  const [puzzle, setPuzzle] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [hiddenIndices, setHiddenIndices] = useState(new Set());
  const [selectedNumberIndex, setSelectedNumberIndex] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [moves, setMoves] = useState(0);
  const [history, setHistory] = useState([]);
  const [bestStars, setBestStars] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isWin, setIsWin] = useState(false);

  // Animation
  const resultAnim = useRef(new Animated.Value(1)).current;

  // Initialize puzzle
  useEffect(() => {
    initializePuzzle();
    loadBestStars();
  }, [difficulty, level]);

  const initializePuzzle = () => {
    const newPuzzle = generatePuzzle(difficulty);
    setPuzzle(newPuzzle);
    setNumbers([...newPuzzle.numbers]);
    setHiddenIndices(new Set());
    setSelectedNumberIndex(null);
    setSelectedOperator(null);
    setCurrentResult(null);
    setMoves(0);
    setHistory([]);
    setStartTime(Date.now());
    setIsWin(false);
  };

  const loadBestStars = async () => {
    try {
      const progress = await getProgress();
      const levelData = progress.campaign[difficulty]?.[level];
      if (levelData) {
        setBestStars(levelData.stars || 0);
      } else {
        setBestStars(0);
      }
    } catch (error) {
      console.warn('Failed to load best stars:', error);
    }
  };

  const handleNumberPress = (index) => {
    if (hiddenIndices.has(index)) return;

    if (selectedNumberIndex === null) {
      // First number selection
      setSelectedNumberIndex(index);
    } else if (selectedOperator !== null) {
      // Second number selection - perform calculation
      const firstNum = numbers[selectedNumberIndex];
      const secondNum = numbers[index];
      let result;

      switch (selectedOperator) {
        case '+':
          result = firstNum + secondNum;
          break;
        case '-':
          result = firstNum - secondNum;
          break;
        case '*':
          result = firstNum * secondNum;
          break;
        case '/':
          if (secondNum !== 0 && firstNum % secondNum === 0) {
            result = firstNum / secondNum;
          } else {
            // Invalid division
            setSelectedNumberIndex(null);
            setSelectedOperator(null);
            return;
          }
          break;
      }

      // Save history for undo
      setHistory([
        ...history,
        {
          numbers: [...numbers],
          hiddenIndices: new Set(hiddenIndices),
          result: currentResult,
        },
      ]);

      // Update state
      const newNumbers = [...numbers];
      newNumbers[index] = result;
      setNumbers(newNumbers);

      const newHidden = new Set(hiddenIndices);
      newHidden.add(selectedNumberIndex);
      setHiddenIndices(newHidden);

      setCurrentResult(result);
      setMoves(moves + 1);
      setSelectedNumberIndex(null);
      setSelectedOperator(null);

      // Animate result
      Animated.sequence([
        Animated.timing(resultAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(resultAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();

      // Check win condition
      if (result === TARGET_NUMBER && newHidden.size === 3) {
        handleWin(result);
      }
    } else if (index === selectedNumberIndex) {
      // Deselect if tapping same number
      setSelectedNumberIndex(null);
    } else {
      // Select different number without operator
      setSelectedNumberIndex(index);
    }
  };

  const handleOperatorPress = (operator) => {
    if (selectedNumberIndex === null) return;

    // Check if operator is allowed for this difficulty
    if (!config.operators.includes(operator)) return;

    if (selectedOperator === operator) {
      setSelectedOperator(null);
    } else {
      setSelectedOperator(operator);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;

    const lastState = history[history.length - 1];
    setNumbers(lastState.numbers);
    setHiddenIndices(lastState.hiddenIndices);
    setCurrentResult(lastState.result);
    setHistory(history.slice(0, -1));
    setMoves(moves > 0 ? moves - 1 : 0);
    setSelectedNumberIndex(null);
    setSelectedOperator(null);
  };

  const handleReset = () => {
    initializePuzzle();
  };

  const handleWin = (finalResult) => {
    setIsWin(true);
    const timeSeconds = Math.floor((Date.now() - startTime) / 1000);
    const stars = calculateStars(
      moves + 1, // Current move counts
      puzzle?.optimalMoves || 3,
      timeSeconds,
      difficulty
    );

    // Navigate to result screen
    setTimeout(() => {
      navigation.replace('Result', {
        difficulty,
        level,
        stars,
        moves: moves + 1,
        time: timeSeconds,
        optimalMoves: puzzle?.optimalMoves || 3,
      });
    }, 500);
  };

  const handleHome = () => {
    navigation.navigate('Home');
  };

  if (!puzzle) {
    return (
      <LinearGradient colors={theme.colors.background} style={styles.container}>
        <Text style={{ color: theme.colors.text }}>Loading...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backIcon, { color: theme.colors.text }]}>
            &#x2190;
          </Text>
        </TouchableOpacity>
        <View style={styles.levelInfo}>
          <Text style={[styles.levelText, { color: accentColor }]}>
            Level {level}
          </Text>
          <Text style={[styles.difficultyText, { color: theme.colors.textMuted }]}>
            {config.name}
          </Text>
        </View>
        <View style={styles.bestStars}>
          <StarRating stars={bestStars} size="small" />
        </View>
      </View>

      {/* Target Display */}
      <View style={styles.targetContainer}>
        <Text style={[styles.targetLabel, { color: theme.colors.textMuted }]}>
          Target
        </Text>
        <View
          style={[
            styles.targetBox,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
            },
          ]}
        >
          <Text style={[styles.targetNumber, { color: theme.colors.success }]}>
            {TARGET_NUMBER}
          </Text>
        </View>
      </View>

      {/* Current Result */}
      <TouchableOpacity
        style={styles.resultContainer}
        onPress={handleUndo}
        disabled={history.length === 0}
        activeOpacity={0.7}
      >
        <Text style={[styles.resultLabel, { color: theme.colors.textMuted }]}>
          {currentResult !== null ? 'Current (tap to undo)' : 'Start combining'}
        </Text>
        <Animated.View
          style={[
            styles.resultBox,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.lg,
              transform: [{ scale: resultAnim }],
              borderWidth: currentResult === TARGET_NUMBER ? 2 : 0,
              borderColor: theme.colors.success,
            },
          ]}
        >
          <Text
            style={[
              styles.resultNumber,
              {
                color:
                  currentResult === TARGET_NUMBER
                    ? theme.colors.success
                    : theme.colors.primary,
              },
            ]}
          >
            {currentResult !== null ? currentResult : '?'}
          </Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Numbers */}
      <View style={styles.numbersContainer}>
        {numbers.map((num, index) => (
          <NumberCard
            key={index}
            value={num}
            onPress={() => handleNumberPress(index)}
            selected={selectedNumberIndex === index}
            hidden={hiddenIndices.has(index)}
            disabled={isWin}
          />
        ))}
      </View>

      {/* Operators */}
      <View style={styles.operatorsContainer}>
        {OPERATORS.map((op) => (
          <OperatorButton
            key={op}
            operator={op}
            onPress={handleOperatorPress}
            selected={selectedOperator === op}
            disabled={
              selectedNumberIndex === null ||
              !config.operators.includes(op) ||
              isWin
            }
          />
        ))}
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
          onPress={handleHome}
        >
          <Text style={[styles.actionIcon, { color: theme.colors.textMuted }]}>
            &#x1F3E0;
          </Text>
          <Text style={[styles.actionLabel, { color: theme.colors.textMuted }]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
          onPress={handleReset}
        >
          <Text style={[styles.actionIcon, { color: theme.colors.textMuted }]}>
            &#x21BB;
          </Text>
          <Text style={[styles.actionLabel, { color: theme.colors.textMuted }]}>
            Reset
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => {
            // Hint feature placeholder
            console.log('Hint requested');
          }}
        >
          <Text style={[styles.actionIcon, { color: theme.colors.secondary }]}>
            &#x1F4A1;
          </Text>
          <Text style={[styles.actionLabel, { color: theme.colors.textMuted }]}>
            Hint
          </Text>
        </TouchableOpacity>
      </View>

      {/* Moves Counter */}
      <View style={styles.movesContainer}>
        <Text style={[styles.movesText, { color: theme.colors.textMuted }]}>
          Moves: {moves}
        </Text>
      </View>
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
    marginBottom: 16,
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
  levelInfo: {
    alignItems: 'center',
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  difficultyText: {
    fontSize: 14,
  },
  bestStars: {
    width: 80,
    alignItems: 'flex-end',
  },
  targetContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  targetLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  targetBox: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  targetNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  resultBox: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minWidth: 120,
    alignItems: 'center',
  },
  resultNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  numbersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  operatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    minWidth: 80,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 12,
  },
  movesContainer: {
    alignItems: 'center',
  },
  movesText: {
    fontSize: 14,
  },
});
