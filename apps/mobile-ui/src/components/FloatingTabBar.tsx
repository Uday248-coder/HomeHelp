import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Ionic from '@expo/vector-icons/Ionicons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { lightColors, fonts, radius, shadows, spacing } from '../theme/tokens';

export interface FloatingTabBarColors {
  surface?: string;
  border?: string;
  active?: string;
  activeText?: string;
  inactive?: string;
  inactiveText?: string;
}

export interface FloatingTabBarExtraProps {
  colors?: FloatingTabBarColors;
}

export function FloatingTabBar({ state, descriptors, navigation, colors }: BottomTabBarProps & FloatingTabBarExtraProps) {
  const palette = colors || {
    surface: lightColors.surface,
    border: lightColors.border,
    active: lightColors.primary,
    activeText: lightColors.primary,
    inactive: lightColors.textMuted,
    inactiveText: lightColors.textMuted,
  };
  const insets = useSafeAreaInsets();
  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);
  const containerRef = React.useRef<View>(null);
  const tabRefs = React.useRef<Array<View | null>>([]);

  React.useEffect(() => {
    const currentTab = tabRefs.current[state.index];
    if (currentTab) {
      currentTab.measureInWindow((x, _y, w) => {
        const parentX = x;
        indicatorX.value = withSpring(parentX, { damping: 18, stiffness: 240, mass: 0.8 });
        indicatorW.value = withSpring(w, { damping: 18, stiffness: 240, mass: 0.8 });
      });
    }
  }, [state.index, indicatorX, indicatorW]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorW.value,
  }));

  return (
    <View
      ref={containerRef as any}
      pointerEvents="box-none"
      style={[styles.container, { paddingBottom: insets.bottom > 0 ? Math.max(insets.bottom - 4, 8) : 12 }]}
    >
      <View style={[styles.bar, { backgroundColor: palette.surface, borderColor: palette.border }, shadows.cardLifted]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.indicator, indicatorStyle, { backgroundColor: (palette.active || lightColors.primary) + '14' }]}
        />
        {state.routes.map((route, i) => {
          const isFocused = state.index === i;
          const { options } = descriptors[route.key];
          const label = (options.tabBarLabel as string) ?? options.title ?? route.name;
          const iconFn = options.tabBarIcon as (props: any) => React.ReactNode;
          const iconName = (options.tabBarIcon as any)?.iconName;
          const activeIconName = (options.tabBarIcon as any)?.activeIconName ?? iconName;
          return (
            <Pressable
              key={route.key}
              ref={(el) => { tabRefs.current[i] = el; }}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name as any);
                }
              }}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              style={styles.tab}
            >
              {iconFn ? (
                iconFn({ focused: isFocused, color: isFocused ? palette.activeText : palette.inactiveText, size: 22 })
              ) : iconName ? (
                <Ionic
                  name={isFocused ? activeIconName : iconName}
                  size={22}
                  color={isFocused ? palette.activeText : palette.inactiveText}
                />
              ) : null}
              <Text style={[
                styles.label,
                { color: isFocused ? palette.activeText : palette.inactiveText, fontFamily: fonts.body },
              ]} numberOfLines={1}>
                {label as any}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: spacing.none,
    pointerEvents: 'box-none',
  } as ViewStyle,
  bar: {
    flexDirection: 'row',
    width: '88%',
    maxWidth: 360,
    padding: 6,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    gap: 2,
    position: 'relative',
  } as ViewStyle,
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: radius.pill,
    zIndex: 1,
  } as ViewStyle,
  label: {
    fontSize: fonts.sizeXs,
    fontWeight: '500' as any,
    letterSpacing: 0.2,
  } as any,
});
