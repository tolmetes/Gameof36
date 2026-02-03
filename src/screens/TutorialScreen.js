// src/screens/TutorialScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Pointer,
  Calculator,
  Merge,
  Sparkles,
  ChevronRight,
  X,
  CheckCircle2,
  Target,
} from 'lucide-react-native';
import { useTheme } from '../themes/ThemeContext';
import { NumberCard, OperatorButton, Button } from '../components';
import { updateSettings } from '../data/storage';
import { TARGET_NUMBER } from '../logic/difficultyConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TUTORIAL_NUMBERS = [9, 9, 9, 9];

const STEPS = [
  {
    title: 'Select a Number',
    prompt: 'Tap any number card to begin',
    icon: Pointer,
    highlightType: 'number',
    highlightIndex: null,
  },
  {
    title: 'Choose Operation',
    prompt: 'Pick + to add the numbers',
    icon: Calculator,
    highlightType: 'operator',
    highlightValue: '+',
  },
  {
    title: 'Combine Numbers',
    prompt: 'Now tap another 9 to add them',
    icon: Merge,
    highlightType: 'number',
    highlightIndex: null,
  },
  {
    title: 'Keep Going!',
    prompt: 'Great! Reach 36 to complete the puzzle',
    icon: Target,
    highlightType: null,
    freePlay: true,
  },
];

// Step indicator component
function StepIndicator({ currentStep, totalSteps, theme }) {
  return (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;

        return (
          <View key={index} style={styles.stepDotContainer}>
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor: isComplete
                    ? theme.colors.success
                    : isActive
                      ? theme.colors.primary
                      : theme.colors.textMuted + '40',
                  width: isActive ? 24 : 8,
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

// Animated prompt card
function PromptCard({ step, theme, isComplete }) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const IconComponent = isComplete ? CheckCircle2 : step.icon;

  useEffect(() => {
    slideAnim.setValue(0);
    Animated.spring(slideAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [step]);

  return (
    <Animated.View
      style={[
        styles.promptCard,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.xl,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
          opacity: slideAnim,
        },
      ]}
    >
      <View
        style={[
          styles.promptIconContainer,
          {
            backgroundColor: isComplete
              ? theme.colors.success + '20'
              : theme.colors.primary + '15',
          },
        ]}
      >
        <IconComponent
          size={28}
          color={isComplete ? theme.colors.success : theme.colors.primary}
          strokeWidth={2}
        />
      </View>
      <View style={styles.promptTextContainer}>
        <Text style={[styles.promptTitle, { color: theme.colors.text }]}>
          {isComplete ? 'Puzzle Complete!' : step.title}
        </Text>
        <Text style={[styles.promptDescription, { color: theme.colors.textMuted }]}>
          {isComplete ? 'You\'ve mastered the basics' : step.prompt}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function TutorialScreen({ navigation }) {
  const { theme, isDark } = useTheme();

  const [step, setStep] = useState(0);
  const [numbers, setNumbers] = useState([...TUTORIAL_NUMBERS]);
  const [hiddenIndices, setHiddenIndices] = useState(new Set());
  const [selectedNumberIndex, setSelectedNumberIndex] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const resultAnim = useRef(new Animated.Value(1)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for highlighted elements
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Glow animation
  useEffect(() => {
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    glow.start();
    return () => glow.stop();
  }, [glowAnim]);

  const currentStepData = STEPS[step] || STEPS[STEPS.length - 1];

  const handleNumberPress = (index) => {
    if (hiddenIndices.has(index)) return;

    if (step === 0 && selectedNumberIndex === null) {
      setSelectedNumberIndex(index);
      setStep(1);
    } else if (step === 2 && selectedOperator !== null && index !== selectedNumberIndex) {
      // Must select a different number
      performCalculation(index);
      setStep(3);
    } else if (currentStepData.freePlay) {
      if (selectedNumberIndex === null) {
        setSelectedNumberIndex(index);
      } else if (selectedOperator !== null && index !== selectedNumberIndex) {
        // Must select a different number
        performCalculation(index);
      } else if (index === selectedNumberIndex) {
        setSelectedNumberIndex(null);
      } else {
        setSelectedNumberIndex(index);
      }
    } else if (index === selectedNumberIndex) {
      setSelectedNumberIndex(null);
    }
  };

  const handleOperatorPress = (operator) => {
    if (step === 1 && selectedNumberIndex !== null) {
      setSelectedOperator(operator);
      setStep(2);
    } else if (currentStepData.freePlay && selectedNumberIndex !== null) {
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

    setHistory([
      ...history,
      {
        numbers: [...numbers],
        hiddenIndices: new Set(hiddenIndices),
        result: currentResult,
      },
    ]);

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
        toValue: 1.15,
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
      // Celebration animation
      Animated.spring(celebrationAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
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
    if (currentStepData.freePlay || isComplete) return false;

    if (type === 'number' && currentStepData.highlightType === 'number') {
      if (currentStepData.highlightIndex === null) return true;
      return currentStepData.highlightIndex === identifier;
    }

    if (type === 'operator' && currentStepData.highlightType === 'operator') {
      return currentStepData.highlightValue === identifier;
    }

    return false;
  };

  return (
    <LinearGradient colors={theme.colors.background} style={styles.container}>
      {/* Header with Skip */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            How to Play
          </Text>
        </View>
        {!isComplete && (
          <TouchableOpacity
            style={[styles.skipButton, { backgroundColor: theme.colors.surface }]}
            onPress={handleSkip}
          >
            <Text style={[styles.skipText, { color: theme.colors.textMuted }]}>
              Skip
            </Text>
            <ChevronRight size={16} color={theme.colors.textMuted} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      {/* Step Progress Indicator */}
      <StepIndicator
        currentStep={isComplete ? STEPS.length : step}
        totalSteps={STEPS.length}
        theme={theme}
      />

      {/* Prompt Card */}
      <PromptCard
        step={currentStepData}
        theme={theme}
        isComplete={isComplete}
      />

      {/* Result Display */}
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
              borderRadius: theme.borderRadius.xl,
              transform: [{ scale: resultAnim }],
              borderWidth: currentResult === TARGET_NUMBER ? 3 : 0,
              borderColor: theme.colors.success,
            },
          ]}
        >
          {/* Animated glow ring when at 36 */}
          {currentResult === TARGET_NUMBER && (
            <Animated.View
              style={[
                styles.glowRing,
                {
                  borderColor: theme.colors.success,
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, 0.6],
                  }),
                  transform: [
                    {
                      scale: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.15],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}
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
        {history.length > 0 && !isComplete && (
          <Text style={[styles.undoHint, { color: theme.colors.textMuted }]}>
            tap to undo
          </Text>
        )}
      </TouchableOpacity>

      {/* Game Board */}
      <View
        style={[
          styles.gameBoard,
          {
            backgroundColor: theme.colors.surface + '30',
            borderRadius: theme.borderRadius.xl,
          },
        ]}
      >
        {/* Numbers Grid */}
        <View style={styles.numbersContainer}>
          {numbers.map((num, index) => {
            const isHighlighted = shouldHighlight('number', index) && !hiddenIndices.has(index);
            return (
              <View key={index} style={styles.cardWrapper}>
                {isHighlighted && (
                  <Animated.View
                    style={[
                      styles.highlightRing,
                      {
                        borderColor: theme.colors.primary,
                        transform: [{ scale: pulseAnim }],
                        opacity: pulseAnim.interpolate({
                          inputRange: [1, 1.08],
                          outputRange: [0.4, 0.8],
                        }),
                      },
                    ]}
                  />
                )}
                <Animated.View
                  style={isHighlighted ? { transform: [{ scale: pulseAnim }] } : undefined}
                >
                  <NumberCard
                    value={num}
                    onPress={() => handleNumberPress(index)}
                    selected={selectedNumberIndex === index}
                    hidden={hiddenIndices.has(index)}
                    disabled={isComplete}
                  />
                </Animated.View>
              </View>
            );
          })}
        </View>

        {/* Operators */}
        <View style={styles.operatorsContainer}>
          {['+', '-', '*', '/'].map((op) => {
            const isHighlighted = shouldHighlight('operator', op);
            return (
              <View key={op} style={styles.operatorWrapper}>
                {isHighlighted && (
                  <Animated.View
                    style={[
                      styles.highlightRingSmall,
                      {
                        borderColor: theme.colors.primary,
                        transform: [{ scale: pulseAnim }],
                        opacity: pulseAnim.interpolate({
                          inputRange: [1, 1.08],
                          outputRange: [0.4, 0.8],
                        }),
                      },
                    ]}
                  />
                )}
                <Animated.View
                  style={isHighlighted ? { transform: [{ scale: pulseAnim }] } : undefined}
                >
                  <OperatorButton
                    operator={op}
                    onPress={handleOperatorPress}
                    selected={selectedOperator === op}
                    disabled={selectedNumberIndex === null || isComplete}
                  />
                </Animated.View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Complete Button */}
      {isComplete && (
        <Animated.View
          style={[
            styles.completeContainer,
            {
              transform: [{ scale: celebrationAnim }],
              opacity: celebrationAnim,
            },
          ]}
        >
          <View style={styles.celebrationRow}>
            <Sparkles size={24} color={theme.colors.primary} strokeWidth={2} />
            <Text style={[styles.celebrationText, { color: theme.colors.text }]}>
              You're ready!
            </Text>
            <Sparkles size={24} color={theme.colors.primary} strokeWidth={2} />
          </View>
          <Button
            title="Start Playing"
            onPress={handleComplete}
            variant="primary"
            size="large"
            fullWidth
          />
        </Animated.View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 2,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  stepDotContainer: {
    alignItems: 'center',
  },
  stepDot: {
    height: 8,
    borderRadius: 4,
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    padding: 20,
    marginBottom: 24,
  },
  promptIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  promptTextContainer: {
    flex: 1,
  },
  promptTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  promptDescription: {
    fontSize: 15,
    lineHeight: 20,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultBox: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 3,
  },
  resultNumber: {
    fontSize: 52,
    fontWeight: '800',
  },
  undoHint: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 10,
    opacity: 0.7,
  },
  gameBoard: {
    marginHorizontal: 16,
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  numbersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  cardWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightRing: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 20,
    borderWidth: 3,
  },
  operatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  operatorWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightRingSmall: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 3,
  },
  completeContainer: {
    paddingHorizontal: 32,
    marginTop: 20,
  },
  celebrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  celebrationText: {
    fontSize: 22,
    fontWeight: '700',
  },
});
