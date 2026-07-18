import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { lightColors, fonts, radius, spacing } from '../theme/tokens';

export interface TextFieldProps {
  label?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmit?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  testID?: string;
  textContentType?: any;
  autoComplete?: any;
  style?: StyleProp<ViewStyle>;
  colors?: typeof lightColors;
  required?: boolean;
}

export function TextField(props: TextFieldProps) {
  const {
    label, value, onChangeText, placeholder, multiline, numberOfLines,
    secureTextEntry, error, helperText, disabled, autoFocus, keyboardType = 'default',
    returnKeyType, onSubmit, leftIcon, rightIcon, testID, textContentType, autoComplete, style,
    colors = lightColors,
    autoCapitalize,
  } = props;

  return (
    <View style={[styles.field, style]}>
      {label ? (
        <Text
          style={[styles.label, { color: colors.textMuted }]}
          accessibilityRole="text"
        >
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.inputWrap,
          { backgroundColor: colors.surface, borderColor: error ? colors.error : colors.border },
          error && styles.inputWrapError,
        ]}
      >
        {leftIcon ? (
          <View style={styles.iconLeft} pointerEvents="none">
            {leftIcon}
          </View>
        ) : null}
        <TextInput
          testID={testID}
          style={[
            styles.input,
            { color: colors.text },
            multiline && styles.inputMultiline,
            leftIcon && { paddingLeft: 0 },
            rightIcon && { paddingRight: 0 },
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={secureTextEntry}
          editable={!disabled}
          autoFocus={autoFocus}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmit}
          textContentType={textContentType}
          autoComplete={autoComplete}
          textAlignVertical={multiline ? 'top' : 'center'}
          accessibilityLabel={label}
        />
        {rightIcon ? (
          <View style={styles.iconRight}>{rightIcon}</View>
        ) : null}
      </View>
      {error ? (
        <Text style={[styles.fieldError, { color: colors.error }]} role="alert">
          {error}
        </Text>
      ) : helperText ? (
        <Text style={[styles.fieldHelper, { color: colors.textMuted }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.md } as ViewStyle,
  label: {
    fontSize: fonts.sizeXs,
    fontWeight: '500',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  } as any,
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth * 1.5,
    paddingHorizontal: spacing.md,
  } as ViewStyle,
  inputWrapError: { borderWidth: 2 } as ViewStyle,
  input: {
    flex: 1,
    fontSize: fonts.sizeBase,
    fontFamily: fonts.body,
    paddingVertical: 0,
    paddingHorizontal: 0,
    minHeight: 44,
  } as any,
  inputMultiline: {
    minHeight: 96,
    paddingVertical: spacing.md,
  } as any,
  iconLeft: {
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  iconRight: {
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  fieldError: {
    fontSize: fonts.sizeXs,
    marginTop: spacing.xs,
    fontWeight: '500',
  } as any,
  fieldHelper: {
    fontSize: fonts.sizeXs,
    marginTop: spacing.xs,
  } as any,
});
