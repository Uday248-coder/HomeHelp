import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors as lightColors, fonts, radius, spacing } from '../theme/tokens';

export interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  iconLeft?: React.ReactNode;
  size?: 'sm' | 'md';
  colors?: typeof lightColors;
  style?: ViewStyle;
}

export function Chip(props: ChipProps) {
  const { label, active = false, onPress, iconLeft, size = 'md', colors = lightColors, style } = props;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={{ selected: onPress ? active : undefined, disabled: !onPress }}
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sizeSm : styles.sizeMd,
        active
          ? { backgroundColor: colors.primary, borderColor: colors.primary }
          : { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.pressed,
        style,
      ]}
    >
      {iconLeft ? (
        <View style={{ marginRight: spacing.xs }}>{iconLeft}</View>
      ) : null}
      <Text
        style={[
          styles.text,
          size === 'sm' ? styles.textSm : styles.textMd,
          active ? { color: colors.textOnAccent } : { color: colors.text },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
  } as ViewStyle,
  sizeSm: { paddingVertical: 6, paddingHorizontal: 12 } as ViewStyle,
  sizeMd: { paddingVertical: 8, paddingHorizontal: spacing.md } as ViewStyle,
  text: { fontFamily: fonts.body, fontWeight: '500' as any } as any,
  textSm: { fontSize: fonts.sizeXs } as any,
  textMd: { fontSize: fonts.sizeSm } as any,
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.92 } as ViewStyle,
});
