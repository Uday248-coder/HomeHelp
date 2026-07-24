import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme';

interface Props {
  style?: ViewStyle;
  preset?: 'card' | 'text' | 'chart' | 'circle';
  width?: number;
  height?: number;
}

export function Skeleton({ style, preset = 'card', width, height }: Props) {
  const { colors } = useTheme();
  const shimmer = colors.skeleton.highlight;

  const dims: { width?: number; height?: number; borderRadius?: number } = (() => {
    switch (preset) {
      case 'text': return { width: width ?? 200, height: height ?? 16, borderRadius: 6 };
      case 'chart': return { width: width ?? 300, height: height ?? 120, borderRadius: 12 };
      case 'circle': return { width: width ?? 48, height: height ?? 48, borderRadius: 24 };
      default: return { width: width ?? '100%', height: height ?? 120, borderRadius: 14 };
    }
  })();

  return <View style={[styles.base, { backgroundColor: colors.skeleton.base, borderRadius: dims.borderRadius, width: dims.width, height: dims.height }, style]} />;
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
});