import React from 'react';
import { TouchableOpacity, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme';

interface Props {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function SegmentedControl({ options, value, onChange, fullWidth, style }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth, style]}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.segment, active && styles.segmentActive, active ? { backgroundColor: colors.brand.primary.base } : { backgroundColor: colors.surface.primary, borderColor: colors.border.base }]}
          >
            <Text style={[styles.text, active && styles.textActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', borderRadius: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: '#CDD3CE' },
  fullWidth: { width: '100%' },
  segment: { flex: 1, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { borderColor: 'transparent' },
  text: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  textActive: { color: '#FFFFFF', fontWeight: '600' },
});