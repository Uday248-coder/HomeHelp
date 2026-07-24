import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/theme';

interface Props {
  message?: string;
}

export function LoadingView({ message }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.loading, { backgroundColor: colors.surface.background }]}>
      <ActivityIndicator color={colors.brand.primary.base} size="large" />
      {message ? <Text style={[styles.text, { color: colors.text.secondary }]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  text: { marginTop: 12, fontSize: 14 },
});