// src/screens/TutorialScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../themes/ThemeContext';
import { NumberCard, OperatorButton, Button } from '../components';
import { updateSettings } from '../data/storage';
import { TARGET_NUMBER } from '../logic/difficultyConfig';

const TUTORIAL_NUMBERS = [9, 9, 9, 9];

const STEPS = [
  {
    prompt: 'Tap a number to select it',
    highlightType: 'number',
    highlightIndex: null, // Any number
  },
  {
    prompt: 'Great! Now pick an operator',
    highlightType: 'operator',
    highlightValue: '+',
  },
  {
    prompt: 'Tap another number to combine',
    highlightType: 'number',
    highlightIndex: null, // Any non-selected number
  },
  {
    prompt: 'You made 18! Keep going to reach 36...',
    highlightType: null,
    freePlay: true,
  },
];

export default function TutorialScreen({ navigation }) {
  const { theme } = useTheme();

  const [step, setStep] = useState(0);
  const [numbers, setNumbers] = useState([...TUTORIAL_NUMBERS]);
  const [hiddenIndices, setHiddenIndices] = useState(new Set());
  const [selectedNumberIndex, setSelectedNumberIndex] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const resultAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for highlighted elements
  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const currentStep = STEPS[step] || STEPS[STEPS.length - 1];

  const handleNumberPress = (index) => {
    if (hiddenIndices.has(index)) return;

    if (step === 0 && selectedNumberIndex === null) {
      // First step: select a number
      setSelectedNumberIndex(index);
      setStep(1);
    } else if (step === 2 && selectedOperator !== null) {
      // Third step: combine numbers
      performCalculation(index);
      setStep(3);
    } else if (currentStep.freePlay) {
      // Free play mode
      if (selectedNumberIndex === null) {
        setSelectedNumberIndex(index);
      } else if (selectedOperator !== null) {
        performCalculation(index);
      } else if (index === selectedNumberIndex) {
        setSelectedNumberIndex(null);
      } else {
        setSelectedNumberIndex(index);
      }
    } else if (index === selectedNumberIndex) {
      // Deselect
      setSelectedNumberIndex(null);
    }
  };

  const handleOperatorPress = (operator) => {
    if (step === 1 && selectedNumberIndex !== null) {
      // Second step: select operator
      setSelectedOperator(operator);
      setStep(2);
    } else if (currentStep.freePlay && selectedNumberIndex !== null) {
      // Free play mode
      if (selectedOperator === operator) {
        setSelectedOperator(null);
      } else {
        setSelectedOperator(operator);
      }
    }
  };

  const performCalculation = (secondIndex) => {
    const firstNum = numbers[selectedNumberIndex];
    const secondNum = numbers[secondIndex];
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
        }
        break;
    }

    if (result === undefined) {
      setSelectedNumberIndex(null);
      setSelectedOperator(null);
      return;
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
    newNumbers[secondIndex] = result;
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
      setIsComplete(true);
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

  const handleSkip = async () => {
    await completeTutorial();
  };

  const handleComplete = async () => {
    await completeTutorial();
  };

  const completeTutorial = async () => {
    try {
      await updateSettings({ tutorialCompleted: true });
    } catch (error) {
      console.warn('Failed to save tutorial status:', error);
    }
    navigation.replace('Home');
  };

  const shouldHighlight = (type, identifier) => {
    if (currentStep.freePlay || isComplete) return false;

    if (type === 'number' && currentStep.highlightType === 'number') {
      if (currentStep.highlightIndex === null) return true;
      return currentStep.highlightIndex === identifier;
    }

    if (type === 'operator' && currentStep.highlightType === 'operator') {
      return currentStep.highlightValue === identifier;
    }

    return false;
  };

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      {/* Skip Button */}
      {!isComplete && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: theme.colors.textMuted }]}>
            Skip
          </Text>
        </TouchableOpacity>
      )}

      {/* Tutorial Title */}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          How to Play
        </Text>
      </View>

      {/* Prompt */}
      <View
        style={[
          styles.promptContainer,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
          },
        ]}
      >
        <Text style={[styles.promptText, { color: theme.colors.text }]}>
          {isComplete ? 'You got it! Ready for real puzzles?' : currentStep.prompt}
        </Text>
      </View>

      {/* Target Display */}
      <View style={styles.targetContainer}>
        <Text style={[styles.targetLabel, { color: theme.colors.textMuted }]}>
          Make this number
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
          <Animated.View
            key={index}
            style={
              shouldHighlight('number', index) && !hiddenIndices.has(index)
                ? { transform: [{ scale: pulseAnim }] }
                : undefined
            }
          >
            <NumberCard
              value={num}
              onPress={() => handleNumberPress(index)}
              selected={selectedNumberIndex === index}
              hidden={hiddenIndices.has(index)}
              disabled={isComplete}
            />
          </Animated.View>
        ))}
      </View>

      {/* Operators */}
      <View style={styles.operatorsContainer}>
        {['+', '-', '*', '/'].map((op) => (
          <Animated.View
            key={op}
            style={
              shouldHighlight('operator', op)
                ? { transform: [{ scale: pulseAnim }] }
                : undefined
            }
          >
            <OperatorButton
              operator={op}
              onPress={handleOperatorPress}
              selected={selectedOperator === op}
              disabled={selectedNumberIndex === null || isComplete}
            />
          </Animated.View>
        ))}
      </View>

      {/* Complete Button */}
      {isComplete && (
        <View style={styles.completeContainer}>
          <Button
            title="Start Playing"
            onPress={handleComplete}
            variant="primary"
            size="large"
          />
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
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  promptContainer: {
    marginHorizontal: 24,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  promptText: {
    fontSize: 18,
    textAlign: 'center',
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
  completeContainer: {
    paddingHorizontal: 48,
    marginTop: 16,
  },
});
