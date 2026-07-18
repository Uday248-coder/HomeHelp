import { Pressable, StyleSheet, View, Text } from 'react-native';
import Ionic from '@expo/vector-icons/Ionicons';
import { lightColors, darkColors, fonts, spacing } from '../theme/tokens';

export interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  isDark?: boolean;
  accessibilityLabel?: string;
  haptic?: 'selection' | 'toggle' | 'confirm' | 'warning' | 'error';
  onHaptic?: (pattern: NonNullable<RatingProps['haptic']>) => void;
}

const dims = { sm: 16, md: 22, lg: 30 };
const labels = ['Poor', 'Fair', 'OK', 'Good', 'Great'];

export function Rating(props: RatingProps) {
  const {
    value, onChange, max = 5, readOnly = false,
    size = 'md', showLabel = false, isDark = false, accessibilityLabel = 'Rating',
    haptic = 'selection', onHaptic,
  } = props;
  const colors = isDark ? darkColors : lightColors;

  function setStar(n: number) {
    if (readOnly || !onChange) return;
    onHaptic?.(haptic);
    onChange(n);
  }

  return (
    <View
      style={styles.wrap}
      accessibilityRole={readOnly ? 'adjustable' : 'radiogroup'}
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max, text: `${value} of ${max}` }}
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < value;
        return (
          <Pressable
            key={i}
            onPress={() => setStar(i + 1)}
            disabled={readOnly}
            accessibilityRole={readOnly ? 'image' : 'radio'}
            accessibilityState={readOnly ? undefined : { checked: i + 1 === value }}
            accessibilityLabel={`Rate ${i + 1}`}
            hitSlop={8}
            style={pressed => ({ transform: [{ scale: pressed ? 1.18 : 1 }] })}
          >
            <Ionic
              name={filled ? 'star' : 'star-outline'}
              size={dims[size]}
              color={filled ? colors.warning : colors.border}
            />
          </Pressable>
        );
      })}
      {showLabel && value > 0 && value <= max ? (
        <Text style={[styles.label, { color: colors.text }]}>
          {labels[value - 1]}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs } as any,
  label: { marginLeft: spacing.sm, fontSize: fonts.sizeSm, fontWeight: '500' as any } as any,
});
