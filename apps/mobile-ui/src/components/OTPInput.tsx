import React from 'react';
import {
  Keyboard,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { lightColors, darkColors, fonts, radius, spacing } from '../theme/tokens';

export interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  onComplete?: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  isDark?: boolean;
  status?: 'default' | 'success' | 'error';
  accessibilityLabel?: string;
}

export function OTPInput(props: OTPInputProps) {
  const {
    value, onChange, length = 6, onComplete,
    autoFocus = false, disabled = false, readOnly = false, isDark = false,
    status = 'default', accessibilityLabel = 'One-time passcode',
  } = props;
  const colors = isDark ? darkColors : lightColors;
  const refs = React.useRef<Array<TextInput | null>>([]);
  const [focusIdx, setFocusIdx] = React.useState<number | null>(null);

  const padded = (value + ' '.repeat(Math.max(0, length - value.length))).slice(0, length);

  React.useEffect(() => {
    if (value.replace(/\s/g, '').length === length) {
      Keyboard.dismiss();
      onComplete?.(value);
    }
  }, [value, length, onComplete]);

  function setDigit(idx: number, d: string, advance = true) {
    if (readOnly || disabled) return;
    const clean = d.replace(/\D/g, '').slice(-1) || ' ';
    const arr = padded.split('');
    arr[idx] = clean;
    const next = arr.join('').replace(/\s+$/g, '');
    onChange(next);
    if (advance && clean !== ' ' && idx + 1 < length) {
      refs.current[idx + 1]?.focus();
      setFocusIdx(idx + 1);
    }
  }

  function onKeyPress(e: any, idx: number) {
    if (readOnly || disabled) return;
    if (e.nativeEvent.key === 'Backspace') {
      e.preventDefault?.();
      if (padded[idx] !== ' ' && padded[idx] !== undefined) {
        setDigit(idx, ' ', false);
      } else if (idx > 0) {
        refs.current[idx - 1]?.focus();
        setFocusIdx(idx - 1);
        setDigit(idx - 1, ' ', false);
      }
    }
  }

  return (
    <View
      style={styles.wrap}
      accessibilityLabel={accessibilityLabel}
    >
      {padded.split('').map((d, i) => (
        <TextInput
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          style={[
            styles.cell,
            { backgroundColor: colors.surface, color: colors.text, borderColor: status === 'success' ? colors.accent : status === 'error' ? colors.error : colors.border },
            focusIdx === i && { borderColor: colors.accent },
          ]}
          value={d.trim()}
          onChangeText={(t) => setDigit(i, t)}
          onKeyPress={(e) => onKeyPress(e, i)}
          keyboardType="numeric"
          maxLength={1}
          editable={!disabled && !readOnly}
          autoFocus={autoFocus && i === 0}
          onFocus={() => setFocusIdx(i)}
          onBlur={() => setFocusIdx(null)}
          textContentType={i === 0 ? 'oneTimeCode' : undefined}
          accessibilityLabel={`Digit ${i + 1} of ${length}`}
          selection={{ start: 0, end: 1 }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  } as any,
  cell: {
    width: 48,
    height: 60,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 24,
    fontWeight: '600' as any,
  } as any,
});
