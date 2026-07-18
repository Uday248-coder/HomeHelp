import { useCallback } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useReducedMotion } from './useReducedMotion';
import { motion } from '../theme/tokens';

const ACTIVE_SCALE = 0.965;
const REST_SCALE = 1;

const PRESS_SPRING = { damping: 16, stiffness: 320, mass: 0.8 };

type SharedValueType<T> = ReturnType<typeof useSharedValue<T>>;

export interface PressScaleResult {
  onPressIn: () => void;
  onPressOut: () => void;
  scale: SharedValueType<number>;
  animatedStyle: ReturnType<typeof useAnimatedProps>;
}

export function usePressScale(disabled = false): PressScaleResult {
  const reduce = useReducedMotion();
  const scale = useSharedValue(REST_SCALE);

  const onPressIn = useCallback(() => {
    if (disabled || reduce) return;
    scale.value = withSpring(ACTIVE_SCALE, PRESS_SPRING);
  }, [disabled, reduce, scale]);

  const onPressOut = useCallback(() => {
    if (disabled || reduce) return;
    scale.value = withSpring(REST_SCALE, motion.easeSpring);
  }, [disabled, reduce, scale]);

  const animatedStyle = useAnimatedProps(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { onPressIn, onPressOut, scale, animatedStyle };
}

// Convenience wrapper that returns the basic transform style ready to
// spread on a Reanimated.View — most components want this exact shape.
export function usePressScaleStyle(disabled = false) {
  const { onPressIn, onPressOut, animatedStyle } = usePressScale(disabled);
  return { onPressIn, onPressOut, style: animatedStyle };
}

export { runOnJS, withTiming };
export default Animated;
