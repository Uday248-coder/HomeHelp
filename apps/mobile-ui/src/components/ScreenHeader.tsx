import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { lightColors, darkColors, fonts, spacing } from '../theme/tokens';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  left?: React.ReactNode;
  isDark?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export function ScreenHeader(props: ScreenHeaderProps) {
  const themeColors = props.isDark ? darkColors : lightColors;
  return (
    <View style={[styles.header, props.containerStyle]}>
      {props.left ? <View style={styles.leftSlot}>{props.left}</View> : null}
      <View style={styles.body}>
        <Text style={[styles.title, { color: themeColors.text }]}>{props.title}</Text>
        {props.subtitle ? (
          <Text style={[styles.subtitle, { color: themeColors.textMuted }]}>{props.subtitle}</Text>
        ) : null}
      </View>
      {props.right ? <View style={styles.rightSlot}>{props.right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  } as ViewStyle,
  leftSlot: { marginRight: spacing.sm } as ViewStyle,
  body: { flex: 1 } as ViewStyle,
  rightSlot: { marginLeft: spacing.sm } as ViewStyle,
  title: {
    fontFamily: fonts.display,
    fontSize: fonts.sizeTitle,
    fontWeight: '700' as any,
    letterSpacing: -0.5,
  } as any,
  subtitle: {
    fontSize: fonts.sizeSm,
    marginTop: 4,
  } as any,
});
