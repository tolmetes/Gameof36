// src/screens/EndlessScreen.js
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
import { NumberCard, OperatorButton } from '../components';
import { generatePuzzle } from '../logic/puzzleGenerator';
import { getProgress, saveProgress, resetSolveStreak, incrementSolveStreak } from '../data/storage';
import { TARGET_NUMBER, DIFFICULTIES } from '../logic/difficultyConfig';

const OPERATORS = ['+', '-', '*', '/'];
const ENDLESS_DIFFICULTY = 'medium'; // Use medium difficulty for endless

export default function EndlessScreen({ navigation }) {
  const { theme } = useTheme();
  const config = DIFFICULTIES[ENDLESS_DIFFICULTY];

  // Game state
  const [puzzle, setPuzzle] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [hiddenIndices, setHiddenIndices] = useState(new Set());
  const [selectedNumberIndex, setSelectedNumberIndex] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [bestRun, setBestRun] = useState(0);
  const [isWin, setIsWin] = useState(false);

  // Animation
  const resultAnim = useRef(new Animated.Value(1)).current;
  const streakAnim = useRef(new Animated.Value(1)).current;

  // Initialize
  useEffect(() => {
    loadStats();
    initializePuzzle();
  }, []);

  const loadStats = async () => {
    try {
      const progress = await getProgress();
      setBestRun(progress.endless?.bestRun || 0);
    } catch (error) {
      console.warn('Failed to load stats:', error);
    }
  };

  const initializePuzzle = () => {
    const newPuzzle = generatePuzzle(ENDLESS_DIFFICULTY);
    setPuzzle(newPuzzle);
    setNumbers([...newPuzzle.numbers]);
    setHiddenIndices(new Set());
    setSelectedNumberIndex(null);
    setSelectedOperator(null);
    setCurrentResult(null);
    setHistory([]);
    setIsWin(false);
  };

  const handleNumberPress = (index) => {
    if (hiddenIndices.has(index) || isWin) return;

    if (selectedNumberIndex === null) {
      setSelectedNumberIndex(index);
    } else if (selectedOperator !== null) {
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
            setSelectedNumberIndex(null);
            setSelectedOperator(null);
            return;
          }
          break;
      }

      // Save history
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
        handleWin();
      }
    } else if (index === selectedNumberIndex) {
      setSelectedNumberIndex(null);
    } else {
      setSelectedNumberIndex(index);
    }
  };

  const handleOperatorPress = (operator) => {
    if (selectedNumberIndex === null) return;
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
    setSelectedNumberIndex(null);
    setSelectedOperator(null);
  };

  const handleReset = async () => {
    // Reset streak on manual reset
    setStreak(0);
    await resetSolveStreak();
    initializePuzzle();
  };

  const handleWin = async () => {
    setIsWin(true);
    const newStreak = streak + 1;
    setStreak(newStreak);

    // Animate streak
    Animated.sequence([
      Animated.timing(streakAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(streakAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Update best run
    if (newStreak > bestRun) {
      setBestRun(newStreak);
      try {
        const progress = await getProgress();
        progress.endless = {
          ...progress.endless,
          bestRun: newStreak,
          totalSolved: (progress.endless?.totalSolved || 0) + 1,
        };
        await saveProgress(progress);
      } catch (error) {
        console.warn('Failed to save endless stats:', error);
      }
    }

    // Auto-generate next puzzle after delay
    setTimeout(() => {
      initializePuzzle();
    }, 1000);
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
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Endless
          </Text>
          <Text style={[styles.bestRun, { color: theme.colors.textMuted }]}>
            Best: {bestRun}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Streak Display */}
      <Animated.View
        style={[
          styles.streakContainer,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            transform: [{ scale: streakAnim }],
          },
        ]}
      >
        <Text style={[styles.streakIcon, { color: theme.colors.secondary }]}>
          &#x1F525;
        </Text>
        <Text style={[styles.streakNumber, { color: theme.colors.text }]}>
          {streak}
        </Text>
        <Text style={[styles.streakLabel, { color: theme.colors.textMuted }]}>
          streak
        </Text>
      </Animated.View>

      {/* Target Display */}
      <View style={styles.targetContainer}>
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
        {history.length > 0 && (
          <Text style={[styles.undoHint, { color: theme.colors.textMuted }]}>
            Tap to undo
          </Text>
        )}
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
          <Text style={[styles.actionIcon, { color: theme.colors.error }]}>
            &#x21BB;
          </Text>
          <Text style={[styles.actionLabel, { color: theme.colors.textMuted }]}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>

      {/* Win Overlay */}
      {isWin && (
        <View style={styles.winOverlay}>
          <Text style={[styles.winText, { color: theme.colors.success }]}>
            +1
          </Text>
        </View>
      )}
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
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bestRun: {
    fontSize: 14,
  },
  placeholder: {
    width: 44,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 16,
  },
  streakIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 8,
  },
  streakLabel: {
    fontSize: 16,
  },
  targetContainer: {
    alignItems: 'center',
    marginBottom: 8,
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
  undoHint: {
    fontSize: 12,
    marginTop: 8,
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
    gap: 24,
    paddingHorizontal: 24,
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
  winOverlay: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  winText: {
    fontSize: 64,
    fontWeight: 'bold',
    opacity: 0.8,
  },
});
