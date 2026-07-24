import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme';

interface Props {
  label: string;
  value: string;
  color?: string;
  style?: ViewStyle;
}

export function MetricCard({ label, value, color, style }: Props) {
  const { colors } = useTheme();
  const c = color ?? colors.brand.primary.base;
  return (
    <View style={[styles.card, { backgroundColor: colors.surface.primary }, style]}>
      <Text style={[styles.value, { color: c }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.text.secondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, padding: 14, borderRadius: 14, alignItems: 'center' },
  value: { fontSize: 22, fontWeight: '700', fontFamily: 'Newsreader' },
  label: { fontSize: 11, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
});