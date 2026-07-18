import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { lightColors, radius, shadows, spacing } from '../theme/tokens';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  /** When true, uses a more generous lg padding. */
  comfortable?: boolean;
  elevated?: boolean;
  background?: string;
}

export function Card({ children, style, padded = true, comfortable = false, elevated = false, background }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        padded && (comfortable ? styles.paddedLg : styles.paddedMd),
        elevated ? shadows.cardLifted : shadows.card,
        background ? { backgroundColor: background } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export interface PressableCardProps extends CardProps {
  onPress: () => void;
  pressedScale?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  haptic?: 'selection' | 'toggle' | 'confirm' | 'warning' | 'error';
  onHaptic?: (pattern: NonNullable<PressableCardProps['haptic']>) => void;
}

export function PressableCard(props: PressableCardProps) {
  const { onPress, children, style, padded = true, comfortable = false, elevated, background, accessibilityLabel, accessibilityHint, testID, disabled } = props;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        padded && (comfortable ? styles.paddedLg : styles.paddedMd),
        elevated ? shadows.cardLifted : shadows.card,
        background ? { backgroundColor: background } : null,
        pressed && styles.pressed,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: lightColors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightColors.border,
  } as ViewStyle,
  paddedMd: { padding: spacing.lg } as ViewStyle,
  paddedLg: { padding: spacing.xl } as ViewStyle,
  pressed: { transform: [{ scale: 0.99 }], opacity: 0.96 } as ViewStyle,
});
