// src/components/OperatorButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

const OPERATOR_SYMBOLS = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
};

export function OperatorButton({ operator, onPress, selected = false, disabled = false }) {
  const { theme, isDark } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const symbol = OPERATOR_SYMBOLS[operator] || operator;

  return (
    <TouchableOpacity
      onPress={() => onPress(operator)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.button,
          {
            borderRadius: theme.borderRadius.full,
            borderColor: theme.colors.primary,
            transform: [{ scale: scaleAnim }],
          },
          selected && {
            backgroundColor: theme.colors.primary,
          },
          !selected && isDark && {
            backgroundColor: 'transparent',
            borderWidth: 2,
          },
          !selected && !isDark && {
            backgroundColor: theme.colors.surface,
            borderWidth: 2,
          },
          disabled && {
            opacity: 0.5,
          },
        ]}
      >
        <Text
          style={[
            styles.symbol,
            {
              color: selected
                ? (isDark ? theme.colors.textDark : theme.colors.surface)
                : theme.colors.primary,
            },
          ]}
        >
          {symbol}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  symbol: {
    fontSize: 28,
    fontWeight: '600',
  },
});
