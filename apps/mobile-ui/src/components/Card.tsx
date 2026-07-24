import React from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '../theme/theme';

type Variant = 'default' | 'elevated' | 'ghost';

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, variant = 'default', style }: Props) {
  const { colors, isDark } = useTheme();

  const bg = variant === 'default' ? colors.surface.primary : colors.surface.secondary;
  const shadowOpacity = variant === 'elevated' ? (isDark ? 0.4 : 0.08) : 0;

  return (
    <View style={[styles.base, { backgroundColor: bg, shadowOpacity }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    padding: 16,
    shadowColor: '#1A2C2B',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 2,
  },
});