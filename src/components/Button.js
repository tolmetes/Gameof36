// src/components/Button.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

export function Button({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost'
  size = 'medium', // 'small' | 'medium' | 'large'
  disabled = false,
  fullWidth = false,
  icon,
}) {
  const { theme, isDark } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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
    small: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 },
    medium: { paddingVertical: 12, paddingHorizontal: 24, fontSize: 16 },
    large: { paddingVertical: 16, paddingHorizontal: 32, fontSize: 18 },
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary,
          textColor: isDark ? theme.colors.textDark : theme.colors.surface,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.surface,
          textColor: theme.colors.text,
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          textColor: theme.colors.primary,
        };
      default:
        return {};
    }
  };

  const variantStyles = getVariantStyles();
  const { paddingVertical, paddingHorizontal, fontSize } = sizeStyles[size];

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
          styles.button,
          {
            backgroundColor: variantStyles.backgroundColor,
            borderRadius: theme.borderRadius.lg,
            paddingVertical,
            paddingHorizontal,
            borderWidth: variantStyles.borderWidth || 0,
            borderColor: variantStyles.borderColor,
            transform: [{ scale: scaleAnim }],
          },
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
        ]}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text
          style={[
            styles.text,
            {
              color: variantStyles.textColor,
              fontSize,
            },
          ]}
        >
          {title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  icon: {
    marginRight: 8,
    fontSize: 18,
  },
});
