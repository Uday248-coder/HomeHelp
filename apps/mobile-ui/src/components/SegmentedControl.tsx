import React from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors as lightColors, fonts, radius, spacing } from '../theme/tokens';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedControlOption<T>[];
  accessibilityLabel?: string;
  colors?: typeof lightColors;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function SegmentedControl<T extends string>(props: SegmentedControlProps<T>) {
  const { value, onChange, options, accessibilityLabel, colors = lightColors, style, fullWidth } = props;
  const [widths, setWidths] = React.useState<number[]>([]);
  const x = useSharedValue(0);
  const w = useSharedValue(0);

  React.useEffect(() => {
    const idx = options.findIndex((o) => o.value === value);
    if (idx >= 0) {
      x.value = withSpring(widths.slice(0, idx).reduce((a, b) => a + b, 0), { damping: 18, stiffness: 240 });
      w.value = withSpring(widths[idx] ?? 0, { damping: 18, stiffness: 240 });
    }
  }, [value, options, widths, x, w]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    width: w.value,
  }));

  function onLayout(e: LayoutChangeEvent, idx: number) {
    const newW = e.nativeEvent.layout.width;
    setWidths((prev) => {
      const next = [...prev];
      next[idx] = newW;
      return next;
    });
  }

  return (
    <View
      style={[styles.wrap, { backgroundColor: colors.surfaceTertiary }, style, fullWidth && styles.fullWidth]}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.indicator, indicatorStyle, { backgroundColor: colors.surface }]}
      />
      {options.map((opt, i) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={opt.label}
            onLayout={(e) => onLayout(e, i)}
            style={styles.tab}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {opt.icon ? <View>{opt.icon}</View> : null}
              <Text
                style={[
                  styles.tabText,
                  { color: selected ? colors.primary : colors.textMuted },
                ]}
                numberOfLines={1}
              >
                {opt.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    padding: 4,
    position: 'relative',
    alignSelf: 'stretch',
  } as ViewStyle,
  fullWidth: { width: '100%' } as ViewStyle,
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: radius.pill,
  } as ViewStyle,
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  } as ViewStyle,
  tabText: {
    fontFamily: fonts.body,
    fontSize: fonts.sizeSm,
    fontWeight: '600' as any,
    letterSpacing: 0.2,
  } as any,
});
