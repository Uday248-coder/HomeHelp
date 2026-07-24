import React, { useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme';

interface Props {
  length?: number;
  value: string;
  onChangeText: (t: string) => void;
  style?: ViewStyle;
}

export function OTPInput({ length = 6, value, onChangeText, style }: Props) {
  const { colors } = useTheme();

  useEffect(() => {
    if (value.length > length) onChangeText(value.slice(0, length));
  }, [value, length, onChangeText]);

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length }).map((_, i) => (
        <View key={i} style={[styles.digit, i < value.length && styles.filled, { borderColor: i < value.length ? colors.brand.primary.base : colors.border.base }]}>
          <Text style={[styles.digitText, { color: i < value.length ? colors.text.primary : colors.text.tertiary }]}>{value[i] ?? ''}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  digit: { width: 48, height: 56, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F4EF' },
  filled: { borderWidth: 2 },
  digitText: { fontSize: 24, fontWeight: '700' },
});