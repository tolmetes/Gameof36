// src/components/NumberCard.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

export function NumberCard({
  value,
  onPress,
  disabled = false,
  selected = false,
  hidden = false,
  size = 'large'
}) {
  const { theme, isDark } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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

  const sizeStyles = {
    large: { width: 72, height: 72, fontSize: theme.typography.sizes.xxl },
    medium: { width: 56, height: 56, fontSize: theme.typography.sizes.xl },
    small: { width: 44, height: 44, fontSize: theme.typography.sizes.lg },
  };

  const { width, height, fontSize } = sizeStyles[size];

  if (hidden) {
    return (
      <Animated.View
        style={[
          styles.card,
          {
            width,
            height,
            backgroundColor: 'transparent',
            borderColor: theme.colors.textMuted,
            borderWidth: 1,
            borderStyle: 'dashed',
            opacity: 0.3,
          },
        ]}
      >
        <Text style={[styles.number, { color: theme.colors.textMuted, fontSize }]}>
          {value}
        </Text>
      </Animated.View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.card,
          {
            width,
            height,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            transform: [{ scale: scaleAnim }],
          },
          selected && {
            borderColor: theme.colors.primary,
            borderWidth: 3,
            ...(isDark && theme.shadows.glow),
          },
          disabled && {
            opacity: 0.5,
          },
        ]}
      >
        <Text
          style={[
            styles.number,
            {
              color: selected ? theme.colors.primary : theme.colors.text,
              fontSize,
            },
          ]}
        >
          {value}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
  },
  number: {
    fontWeight: 'bold',
  },
});
