import { StyleSheet, View, Text } from 'react-native';
import { lightColors, darkColors, fonts, radius } from '../theme/tokens';

const statusColorsLight: Record<string, string> = {
  pending: lightColors.statusPending,
  assigned: lightColors.statusAssigned,
  in_progress: lightColors.statusInProgress,
  completed: lightColors.statusCompleted,
  cancelled: lightColors.statusCancelled,
};

const statusColorsDark: Record<string, string> = {
  pending: darkColors.statusPending,
  assigned: darkColors.statusAssigned,
  in_progress: darkColors.statusInProgress,
  completed: darkColors.statusCompleted,
  cancelled: darkColors.statusCancelled,
};

export interface StatusBadgeProps {
  status: string;
  label?: string;
  isDark?: boolean;
}

export function StatusBadge({ status, label, isDark = false }: StatusBadgeProps) {
  const colors = isDark ? statusColorsDark : statusColorsLight;
  const color = colors[status] || lightColors.textMuted;
  return (
    <View
      style={[styles.badge, { backgroundColor: `${color}1A`, borderColor: `${color}40` }]}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${label || status.replace('_', ' ')}`}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>
        {(label || status).replace('_', ' ')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    gap: 6,
  } as any,
  dot: { width: 6, height: 6, borderRadius: 3 } as any,
  text: {
    fontSize: fonts.sizeXs,
    fontWeight: '600' as any,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  } as any,
});
