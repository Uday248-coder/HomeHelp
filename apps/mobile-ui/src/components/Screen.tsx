import React from 'react';
import { SafeAreaView, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Screen({ children, style }: Props) {
  const { colors } = useTheme();
  return <SafeAreaView style={[styles.screen, { backgroundColor: colors.surface.background }, style]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
});