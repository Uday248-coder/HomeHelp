import { ActivityIndicator, StyleSheet, View, ViewStyle, Text } from 'react-native';
import { lightColors, darkColors, fonts, spacing } from '../theme/tokens';

export interface LoadingViewProps {
  message?: string;
  isDark?: boolean;
  style?: ViewStyle;
}

export function LoadingView({ message, isDark = false, style }: LoadingViewProps) {
  const colors = isDark ? darkColors : lightColors;
  return (
    <View style={[styles.base, { backgroundColor: colors.background }, style]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? (
        <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  } as ViewStyle,
  message: {
    marginTop: spacing.md,
    fontSize: fonts.sizeSm,
  } as any,
});
