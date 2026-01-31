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

      {/* Display Section - Target and Current Result side by side */}
      <View style={styles.displaySection}>
        {/* Target Display */}
        <View style={styles.displayCard}>
          <Text style={[styles.displayLabel, { color: theme.colors.textMuted }]}>
            TARGET
          </Text>
          <View
            style={[
              styles.displayBox,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.xl,
              },
            ]}
          >
            <Text style={[styles.displayNumber, { color: theme.colors.success }]}>
              {TARGET_NUMBER}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.displayDivider}>
          <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>→</Text>
        </View>

        {/* Current Result */}
        <TouchableOpacity
          style={styles.displayCard}
          onPress={handleUndo}
          disabled={history.length === 0}
          activeOpacity={0.7}
        >
          <Text style={[styles.displayLabel, { color: theme.colors.textMuted }]}>
            {history.length > 0 ? 'TAP TO UNDO' : 'CURRENT'}
          </Text>
          <Animated.View
            style={[
              styles.displayBox,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.xl,
                transform: [{ scale: resultAnim }],
                borderWidth: currentResult === TARGET_NUMBER ? 3 : 0,
                borderColor: theme.colors.success,
              },
            ]}
          >
            <Text
              style={[
                styles.displayNumber,
                {
                  color:
                    currentResult === TARGET_NUMBER
                      ? theme.colors.success
                      : currentResult !== null
                        ? theme.colors.primary
                        : theme.colors.textMuted,
                },
              ]}
            >
              {currentResult !== null ? currentResult : '—'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Game Board Container */}
      <View style={[styles.gameBoard, { backgroundColor: theme.colors.surface + '40' }]}>
        {/* Numbers Grid */}
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

        {/* Operators Row */}
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
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Moves Counter - More prominent */}
        <View style={[styles.movesContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.movesLabel, { color: theme.colors.textMuted }]}>MOVES</Text>
          <Text style={[styles.movesValue, { color: accentColor }]}>{moves}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={handleHome}
          >
            <Text style={[styles.actionIcon, { color: theme.colors.textMuted }]}>
              &#x2190;
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonLarge, { backgroundColor: accentColor + '20', borderColor: accentColor }]}
            onPress={handleReset}
          >
            <Text style={[styles.actionIcon, { color: accentColor }]}>
              &#x21BB;
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
              ?
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    marginBottom: 20,
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
  levelInfo: {
    alignItems: 'center',
  },
  levelText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  bestStars: {
    width: 80,
    alignItems: 'flex-end',
  },
  // New display section styles
  displaySection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  displayCard: {
    alignItems: 'center',
    flex: 1,
  },
  displayLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  displayBox: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  displayNumber: {
    fontSize: 36,
    fontWeight: '800',
  },
  displayDivider: {
    paddingHorizontal: 16,
  },
  dividerText: {
    fontSize: 24,
    opacity: 0.5,
  },
  // Game board container
  gameBoard: {
    marginHorizontal: 16,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  numbersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  operatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  // Bottom section
  bottomSection: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  movesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 16,
  },
  movesLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginRight: 8,
  },
  movesValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
  },
  actionIcon: {
    fontSize: 22,
    fontWeight: '600',
  },
});
