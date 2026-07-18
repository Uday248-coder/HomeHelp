import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { lightColors, darkColors, fonts, radius, spacing } from '../theme/tokens';
import Ionic from '@expo/vector-icons/Ionicons';

export interface EmptyStateProps {
  title: string;
  message?: string;
  /** lucide-style icon name from @expo/vector-icons/Ionicons */
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  isDark?: boolean;
}

export function EmptyState(props: EmptyStateProps) {
  const colors = props.isDark ? darkColors : lightColors;
  return (
    <View style={styles.base}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceSecondary }]}>
        {props.icon ? (
          <Ionic name={props.icon as any} size={28} color={colors.textMuted} />
        ) : (
          <Ionic name="chatbubble-ellipses-outline" size={28} color={colors.textMuted} />
        )}
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{props.title}</Text>
      {props.message ? (
        <Text style={[styles.message, { color: colors.textMuted }]}>{props.message}</Text>
      ) : null}
      {props.actionLabel && props.onAction ? (
        <Pressable
          style={({ pressed }) => [styles.action, { backgroundColor: colors.primary }, pressed && { opacity: 0.9 }]}
          onPress={props.onAction}
          accessibilityRole="button"
          accessibilityLabel={props.actionLabel}
        >
          <Text style={styles.actionText}>{props.actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  } as ViewStyle,
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  } as ViewStyle,
  title: {
    fontFamily: fonts.body,
    fontSize: fonts.sizeLg,
    fontWeight: '600' as any,
    textAlign: 'center',
  } as any,
  message: {
    marginTop: 6,
    fontSize: fonts.sizeSm,
    textAlign: 'center',
    lineHeight: 20,
  } as any,
  action: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
  } as ViewStyle,
  actionText: {
    color: lightColors.textOnAccent,
    fontSize: fonts.sizeSm,
    fontWeight: '600' as any,
  } as any,
});
