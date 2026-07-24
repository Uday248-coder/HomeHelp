import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/theme';

interface Props {
  status: string;
  label?: string;
}

const statusColorMap: Record<string, string> = {
  pending: '#B45309',
  assigned: '#1D4ED8',
  in_progress: '#0F766E',
  completed: '#16A34A',
  cancelled: '#B91C1C',
};

export function StatusBadge({ status, label }: Props) {
  const { colors, isDark } = useTheme();
  const color = isDark ? (statusColorMap[status] ?? colors.text.secondary) : (statusColorMap[status] ?? colors.text.secondary);

  return (
    <View style={[styles.badge, { backgroundColor: color + '1A', borderColor: color + '40' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{(label ?? status).replace('_', ' ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
});