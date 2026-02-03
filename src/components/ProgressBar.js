// src/components/ProgressBar.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

export function ProgressBar({
  current,
  total,
  label,
  showPercentage = false,
  color,
  animated = true
}) {
  const { theme } = useTheme();
  const widthAnim = useRef(new Animated.Value(0)).current;

  const percentage = total > 0 ? (current / total) * 100 : 0;
  const barColor = color || theme.colors.primary;

  useEffect(() => {
    if (animated) {
      Animated.spring(widthAnim, {
        toValue: percentage,
        friction: 8,
        useNativeDriver: false,
      }).start();
    } else {
      widthAnim.setValue(percentage);
    }
  }, [percentage, animated]);

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {label}
          </Text>
          <Text style={[styles.count, { color: theme.colors.textMuted }]}>
            {current}/{total}
            {showPercentage && ` (${Math.round(percentage)}%)`}
          </Text>
        </View>
      )}
      <View style={[styles.track, { backgroundColor: theme.colors.surfaceLight }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              width: widthAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  count: {
    fontSize: 14,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
