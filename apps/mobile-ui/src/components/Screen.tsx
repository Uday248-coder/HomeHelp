import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
  type Edge,
} from 'react-native-safe-area-context';
import { lightColors, spacing } from '../theme/tokens';

export interface ScreenProps {
  children: React.ReactNode;
  edges?: Edge[];
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  edges = ['top', 'bottom', 'left', 'right'],
  backgroundColor = lightColors.background,
  style,
}: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={[styles.screen, { backgroundColor }, style]}>
      {children}
    </SafeAreaView>
  );
}

export interface ScreenScrollProps {
  children: React.ReactNode;
  keyboardAware?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  scrollRef?: React.Ref<ScrollView>;
  onScroll?: (event: any) => void;
  keyboardShouldPersistTaps?: 'always' | 'handled' | 'never';
}

export function ScreenScroll({
  children,
  keyboardAware = true,
  contentContainerStyle,
  backgroundColor = lightColors.background,
  edges = ['top', 'left', 'right'],
  style,
  scrollRef,
  onScroll,
  keyboardShouldPersistTaps = 'handled',
}: ScreenScrollProps) {
  const insets = useSafeAreaInsets();
  const wrap = (content: React.ReactNode) => {
    if (!keyboardAware) return content;
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {content}
      </KeyboardAvoidingView>
    );
  };
  return (
    <SafeAreaView edges={edges} style={[styles.screen, { backgroundColor }]}>
      {wrap(
        <ScrollView
          ref={scrollRef}
          style={[styles.flex, style]}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.lg },
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          keyboardDismissMode="interactive"
          contentInsetAdjustmentBehavior="automatic"
          onScroll={onScroll}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 } as ViewStyle,
  flex: { flex: 1 } as ViewStyle,
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  } as ViewStyle,
});
