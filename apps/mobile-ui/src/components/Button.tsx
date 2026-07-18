import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { lightColors, fonts, radius, shadows } from '../theme/tokens';

// Note: Button resolves colors from a `colors` prop fallback chain rather than
// requiring a ThemeProvider — keeps the component simple and avoids a context
// dependency before the apps wire ThemeProvider. Apps passing a dark palette
// via the `colors` prop will get the correct variants automatically.

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'warm';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  colors?: typeof lightColors;
  haptic?: 'selection' | 'toggle' | 'confirm' | 'warning' | 'error';
  onHaptic?: (pattern: NonNullable<ButtonProps['haptic']>) => void;
}

const sizeStyles: Record<ButtonSize, { height: number; paddingH: number; font: number; radius: number }> = {
  sm: { height: 36, paddingH: 12, font: fonts.sizeSm, radius: radius.pill },
  md: { height: 48, paddingH: 18, font: fonts.sizeMd, radius: radius.pill },
  lg: { height: 56, paddingH: 24, font: fonts.sizeLg, radius: radius.pill },
  icon: { height: 44, paddingH: 0, font: fonts.sizeMd, radius: radius.pill },
};

export function Button(props: ButtonProps) {
  const {
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    iconLeft,
    iconRight,
    testID,
    accessibilityLabel,
    accessibilityHint,
    style,
    colors = lightColors,
  } = props;

  const s = sizeStyles[size];
  const variantStyle = stylesForVariant(variant, colors);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        { height: s.height, paddingHorizontal: s.paddingH, borderRadius: s.radius },
        variantStyle,
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text.color} size="small" />
      ) : (
        <>
          {iconLeft != null && <IconSlot size={size}>{iconLeft}</IconSlot>}
          <Text
            style={[
              styles.text,
              { fontSize: s.font },
              variantStyle.text,
              !!iconLeft && { marginLeft: 6 },
              !!iconRight && { marginRight: 6 },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {iconRight != null && <IconSlot size={size}>{iconRight}</IconSlot>}
        </>
      )}
    </Pressable>
  );
}

function IconSlot({ size, children }: { size: ButtonSize; children: React.ReactNode }) {
  const dim = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;
  return (
    <Animated.View
      style={{ width: dim, height: dim, justifyContent: 'center', alignItems: 'center' }}
      accessible={false}
    >
      {children}
    </Animated.View>
  );
}

function stylesForVariant(variant: ButtonVariant, colors: typeof lightColors) {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: colors.primary,
        ...shadows.button,
        text: { color: colors.textOnAccent, fontWeight: fonts.weightSemiBold as any },
      };
    case 'secondary':
      return {
        backgroundColor: colors.surface,
        borderWidth: StyleSheet.hairlineWidth * 1.5,
        borderColor: colors.border,
        ...shadows.soft,
        text: { color: colors.text, fontWeight: fonts.weightSemiBold as any },
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        text: { color: colors.primary, fontWeight: fonts.weightSemiBold as any },
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderWidth: StyleSheet.hairlineWidth * 1.5,
        borderColor: colors.primary,
        text: { color: colors.primary, fontWeight: fonts.weightSemiBold as any },
      };
    case 'danger':
    case 'warm':
      return {
        backgroundColor: colors.error,
        ...shadows.soft,
        text: { color: colors.white, fontWeight: fonts.weightSemiBold as any },
      };
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  } as ViewStyle,
  fullWidth: { alignSelf: 'stretch' } as ViewStyle,
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.92 } as ViewStyle,
  disabled: { opacity: 0.5 } as ViewStyle,
  text: {
    fontFamily: fonts.body,
    letterSpacing: 0.1,
  } as any,
});
