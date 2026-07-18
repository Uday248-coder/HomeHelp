import React from 'react';
import { StyleSheet, View, ViewStyle, Text } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { lightColors, fonts, radius, shadows, spacing } from '../theme/tokens';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface MetricCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon?: React.ReactNode;
  tint?: string;
  colors?: typeof lightColors;
  style?: ViewStyle;
  duration?: number;
}

export function MetricCard(props: MetricCardProps) {
  const {
    label, value, prefix = '', suffix = '', decimals = 0,
    icon, tint, colors = lightColors, style, duration = 900,
  } = props;
  const reduce = useReducedMotion();
  const animated = useSharedValue(reduce ? value : 0);
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    if (reduce) {
      animated.value = value;
      setDisplayValue(value);
      return;
    }
    animated.value = withTiming(value, { duration }, (finished) => {
      if (finished) {
        setDisplayValue(value);
      }
    });
  }, [value, reduce, duration, animated]);

  const formattedValue = `${prefix}${displayValue.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}${suffix}`;

  return (
    <View style={[styles.base, { backgroundColor: colors.surface }, style]}>
      {icon ? (
        <View style={[styles.icon, { backgroundColor: (tint || colors.accent) + '20' }]}>
          {icon}
        </View>
      ) : null}
      <View style={styles.body}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
        <Animated.Text style={[styles.value, { color: tint || colors.text }]}>{formattedValue}</Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'column',
    gap: 8,
    padding: spacing.md,
    borderRadius: radius.lg,
    ...shadows.card,
  } as ViewStyle,
  icon: {
    alignSelf: 'flex-start',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  } as ViewStyle,
  body: { flexShrink: 1 } as ViewStyle,
  label: {
    fontSize: fonts.sizeXs,
    fontWeight: '500' as any,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  } as any,
  value: {
    fontSize: fonts.size2xl,
    fontWeight: '700' as any,
    fontFamily: fonts.body,
    marginTop: 4,
  } as any,
});