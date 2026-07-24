import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, type ViewStyle, type TextStyle } from 'react-native';
import { useTheme } from '../theme/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const sizeTokens: Record<Size, { paddingV: number; paddingH: number; fontSize: number; borderRadius: number }> = {
  sm: { paddingV: 8, paddingH: 14, fontSize: 13, borderRadius: 8 },
  md: { paddingV: 12, paddingH: 20, fontSize: 15, borderRadius: 12 },
  lg: { paddingV: 16, paddingH: 24, fontSize: 16, borderRadius: 14 },
};

export function Button({ title, onPress, variant = 'primary', size = 'md', loading, disabled, style }: Props) {
  const { colors } = useTheme();
  const s = sizeTokens[size];
  const isDisabled = disabled || loading;

  const bg = (() => {
    switch (variant) {
      case 'primary': return colors.brand.primary.base;
      case 'secondary': return colors.surface.primary;
      case 'ghost': return 'transparent';
      case 'outline': return 'transparent';
      case 'danger': return colors.status.error;
    }
  })();

  const borderWidth = (variant === 'outline' || variant === 'secondary') ? 1.5 : 0;
  const borderColor = (() => {
    switch (variant) {
      case 'outline': return colors.brand.primary.base;
      case 'secondary': return colors.border.base;
      default: return 'transparent';
    }
  })();

  const textColor = (() => {
    switch (variant) {
      case 'primary': case 'danger': return colors.text.onAccent;
      case 'ghost': return colors.brand.primary.base;
      default: return colors.text.primary;
    }
  })();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[styles.base, { backgroundColor: bg, borderWidth, borderColor, opacity: isDisabled ? 0.55 : 1 }, style]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize: s.fontSize }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});