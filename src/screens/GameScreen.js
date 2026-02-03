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
import { ChevronLeft, Home, RotateCcw, HelpCircle, Undo2 } from 'lucide-react-native';
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
  const [originalNumbers, setOriginalNumbers] = useState([]); // Store original for reset
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
    setOriginalNumbers([...newPuzzle.numbers]); // Save original numbers for reset
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

  const resetPuzzle = () => {
    // Reset to original numbers without generating a new puzzle
    setNumbers([...originalNumbers]);
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
    } else if (selectedOperator !== null && index !== selectedNumberIndex) {
      // Second number selection - perform calculation (must be different number)
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
    resetPuzzle();
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
          style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={22} color={theme.colors.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.levelInfo}>
          <Text style={[styles.levelText, { color: theme.colors.text }]}>
            Level {level}
          </Text>
          <Text style={[styles.difficultyText, { color: theme.colors.textMuted }]}>
            {config.name}
          </Text>
        </View>
        <View style={styles.headerButton}>
          <StarRating stars={bestStars} size="small" />
        </View>
      </View>

      {/* Current Result Display */}
      <TouchableOpacity
        style={styles.displaySection}
        onPress={handleUndo}
        disabled={history.length === 0}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.resultBox,
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
              styles.resultNumber,
              {
                color:
                  currentResult === TARGET_NUMBER
                    ? theme.colors.success
                    : currentResult !== null
                      ? theme.colors.text
                      : theme.colors.textMuted,
              },
            ]}
          >
            {currentResult !== null ? currentResult : '—'}
          </Text>
        </Animated.View>
        {history.length > 0 && (
          <Text style={[styles.undoHint, { color: theme.colors.textMuted }]}>
            tap to undo
          </Text>
        )}
      </TouchableOpacity>

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
            <Home size={22} color={theme.colors.textMuted} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: history.length > 0
                  ? theme.colors.primary + '15'
                  : theme.colors.surface,
              },
            ]}
            onPress={handleUndo}
            disabled={history.length === 0}
          >
            <Undo2
              size={22}
              color={history.length > 0 ? theme.colors.primary : theme.colors.textMuted + '50'}
              strokeWidth={2}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.actionButtonLarge,
              {
                backgroundColor: history.length > 0
                  ? accentColor + '20'
                  : theme.colors.surface,
                borderColor: history.length > 0
                  ? accentColor
                  : theme.colors.textMuted + '30',
              },
            ]}
            onPress={handleReset}
            disabled={history.length === 0}
          >
            <RotateCcw
              size={26}
              color={history.length > 0 ? accentColor : theme.colors.textMuted + '50'}
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
              // Hint feature placeholder
              console.log('Hint requested');
            }}
          >
            <HelpCircle size={22} color={theme.colors.secondary} strokeWidth={2} />
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
    marginBottom: 24,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelInfo: {
    flex: 1,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  // Result display
  displaySection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resultBox: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minWidth: 120,
    alignItems: 'center',
  },
  resultNumber: {
    fontSize: 48,
    fontWeight: '800',
  },
  undoHint: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 8,
    opacity: 0.7,
  },
  // Game board container
  gameBoard: {
    marginHorizontal: 12,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  numbersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
});
