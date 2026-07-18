import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { lightColors, radius, spacing } from '../theme/tokens';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 14, radius: r = 8, style }: SkeletonProps) {
  const reduced = useReducedMotion();
  const shimmerX = useSharedValue(-120);

  React.useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      shimmerX.value = withTiming(120, { duration: 1500, easing: Easing.linear }, () => {
        runOnJS(() => { shimmerX.value = -120; })();
      });
    }, 1600);
    return () => clearInterval(id);
  }, [reduced]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  return (
    <View
      style={[styles.base, {
        width: width as any, height: height as any, borderRadius: r,
        backgroundColor: lightColors.shimmerBase,
      }, style]}
      accessibilityRole="none"
      accessibilityLabel="Loading"
    >
      <Animated.View style={[styles.shimmer, { backgroundColor: lightColors.shimmerHighlight }, animatedStyle]} />
    </View>
  );
}

import { Easing } from 'react-native-reanimated';

const styles = StyleSheet.create({
  base: { overflow: 'hidden' } as ViewStyle,
  shimmer: {
    position: 'absolute', top: 0, bottom: 0, left: 0,
    width: '40%',
    opacity: 0.6,
  } as ViewStyle,
});

export function SkeletonBookingCard() {
  return (
    <View style={styles2.wrap}>
      <View style={styles2.row}>
        <Skeleton height={18} width={160} />
        <Skeleton height={20} width={48} radius={10} />
      </View>
      <View style={{ height: 1, backgroundColor: 'transparent', marginVertical: 8 }} />
      <Skeleton height={14} />
      <View style={{ height: 6 }} />
      <Skeleton height={14} width="70%" />
      <View style={{ height: 12 }} />
      <View style={styles2.btnRow}>
        <Skeleton height={36} width={100} radius={18} />
        <Skeleton height={36} width={88} radius={18} />
      </View>
    </View>
  );
}

const styles2 = StyleSheet.create({
  wrap: {
    backgroundColor: lightColors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightColors.border,
  } as ViewStyle,
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } as ViewStyle,
  btnRow: { flexDirection: 'row', gap: spacing.sm } as ViewStyle,
});
