import React from 'react';
import { View, TextInput, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme';

interface Props {
  label?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  error?: string;
  style?: ViewStyle;
}

export function TextField({ label, value, onChangeText, placeholder, multiline, secureTextEntry, error, style }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.field, style]}>
      {label ? <Text style={[styles.label, { color: colors.text.secondary }]}>{label}</Text> : null}
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {error ? <Text style={[styles.fieldError, { color: colors.status.error }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  input: { minHeight: 52, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#CDD3CE', paddingHorizontal: 16, fontSize: 15, color: '#1A2C2B', textAlignVertical: 'center' },
  inputMultiline: { minHeight: 88, paddingTop: 12, paddingBottom: 12, textAlignVertical: 'top' },
  inputError: { borderColor: '#DC2626' },
  fieldError: { fontSize: 11, marginTop: 6 },
});