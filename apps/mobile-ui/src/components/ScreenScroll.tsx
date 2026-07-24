import React from 'react';
import { SafeAreaView, ScrollView, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  keyboardAware?: boolean;
}

export function ScreenScroll({ children, style, contentStyle, keyboardAware }: Props) {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.surface.background }]}>
      <ScrollView
        style={style}
        contentContainerStyle={[styles.content, contentStyle]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
});