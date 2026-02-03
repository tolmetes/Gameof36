// src/components/StarRating.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../themes/ThemeContext';

export function StarRating({ stars, size = 'medium', animated = false }) {
  const { theme } = useTheme();
  const animations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    if (animated) {
      // Stagger star animations
      Animated.stagger(200, [
        Animated.spring(animations[0], {
          toValue: stars >= 1 ? 1 : 0,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.spring(animations[1], {
          toValue: stars >= 2 ? 1 : 0,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.spring(animations[2], {
          toValue: stars >= 3 ? 1 : 0,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      animations.forEach((anim, i) => anim.setValue(stars > i ? 1 : 0));
    }
  }, [stars, animated]);

  const sizes = {
    small: 16,
    medium: 24,
    large: 36,
  };

  const starSize = sizes[size];

  return (
    <View style={styles.container}>
      {[0, 1, 2].map((i) => (
        <Animated.Text
          key={i}
          style={[
            styles.star,
            {
              fontSize: starSize,
              color: theme.colors.secondary,
              opacity: animated ? animations[i] : (stars > i ? 1 : 0.3),
              transform: animated
                ? [{
                    scale: animations[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  }]
                : [],
            },
          ]}
        >
          ★
        </Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 2,
  },
});
