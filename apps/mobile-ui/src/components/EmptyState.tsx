import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/theme';

interface Props {
  icon?: string;
  title: string;
  message?: string;
}

export function EmptyState({ icon = '📋', title, message }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.icon, { backgroundColor: colors.surface.primary }]}>
        <Text style={styles.emoji}>{icon}</Text>
      </View>
      <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
      {message ? <Text style={[styles.message, { color: colors.text.secondary }]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  icon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#1A2C2B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  emoji: { fontSize: 32 },
  title: { fontSize: 16, fontWeight: '600', color: '#1A2C2B' },
  message: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 6, lineHeight: 20 },
});