import React from 'react';
import { TouchableOpacity, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme';

interface Props {
  rating: number;
  editable?: boolean;
  onRate?: (n: number) => void;
  size?: number;
}

export function Rating({ rating, editable, onRate, size = 24 }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => editable && onRate?.(n)} disabled={!editable}>
          <Text style={[styles.star, { fontSize: size, color: n <= rating ? '#F59E0B' : colors.border.base }]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  star: { letterSpacing: 2 },
});