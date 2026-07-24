import { useRef } from 'react';
import { Animated } from 'react-native';
import { useTheme } from '../theme/theme';

export function usePressScale() {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  function onPressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 80, friction: 8 }).start();
  }
  function onPressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }).start();
  }

  return { scale, onPressIn, onPressOut };
}