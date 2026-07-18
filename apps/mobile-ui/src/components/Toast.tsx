import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ViewStyle, Text } from 'react-native';
import Ionic from '@expo/vector-icons/Ionicons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { lightColors, darkColors, fonts, radius, shadows, spacing } from '../theme/tokens';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

let nextId = 1;

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

export function ToastProvider({
  children,
  isDark = false,
}: {
  children: React.ReactNode;
  isDark?: boolean;
}) {
  const colors = isDark ? darkColors : lightColors;
  const [toasts, setToasts] = useState<Toast[]>([]);
  const insets = useSafeAreaInsets();

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = nextId++;
    setToasts((prev) => [...prev.slice(-2), { ...t, id }]);
    const duration = t.duration ?? 4000;
    if (duration > 0) setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {children}
      </View>
      <View
        style={[
          styles.container,
          { top: insets.top + spacing.sm, paddingHorizontal: spacing.lg },
        ]}
        pointerEvents="box-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} colors={colors} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss, colors }: { toast: Toast; onDismiss: () => void; colors: typeof lightColors }) {
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 22, stiffness: 260, mass: 0.9 });
    opacity.value = withTiming(1, { duration: 180 });
  }, [translateY, opacity]);

  function dismiss() {
    translateY.value = withSpring(-120, { damping: 24, stiffness: 280 });
    opacity.value = withTiming(0, { duration: 160 }, () => runOnJS(onDismiss)());
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const icon = toast.variant === 'success' ? 'checkmark-circle'
    : toast.variant === 'error' ? 'alert-circle'
    : 'information-circle';
  const iconColor = toast.variant === 'success' ? colors.success
    : toast.variant === 'error' ? colors.error
    : colors.textSecondary;

  return (
    <Animated.View
      style={[styles.toast, { backgroundColor: colors.surface }, animatedStyle]}
      onAccessibilityAction={(e) => { if (e.nativeEvent.actionName === 'dismiss') dismiss(); }}
      accessibilityActions={[{ name: 'dismiss', label: 'Dismiss' }]}
    >
      <View style={styles.icon}>
        <Ionic name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.text }]}>{toast.title}</Text>
        {toast.description ? (
          <Text style={[styles.description, { color: colors.textMuted }]}>{toast.description}</Text>
        ) : null}
      </View>
      <Text
        style={[styles.x, { color: colors.textMuted }]}
        onPress={dismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
      >
        <Ionic name="close" size={16} color={colors.textMuted} />
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', left: 0, right: 0,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
    pointerEvents: 'box-none',
  } as ViewStyle,
  toast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    minWidth: 280,
    maxWidth: 380,
    ...shadows.cardLifted,
  } as ViewStyle,
  icon: { marginTop: 2 } as ViewStyle,
  body: { flex: 1, minWidth: 0 } as ViewStyle,
  title: { fontSize: fonts.sizeBase, fontWeight: '600' as any, marginBottom: 2 } as any,
  description: { fontSize: fonts.sizeSm } as any,
  x: { padding: 4 } as any,
});
