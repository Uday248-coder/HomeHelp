import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../theme/theme';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Props {
  visible: boolean;
  message: string;
  type?: ToastType;
  onClose?: () => void;
}

export function Toast({ visible, message, type = 'info', onClose }: Props) {
  const { colors } = useTheme();
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 8 }).start();
      const t = setTimeout(() => {
        Animated.timing(slideAnim, { toValue: -100, duration: 300, useNativeDriver: true }).start(() => {
          setShow(false);
          onClose?.();
        });
      }, 3000);
      return () => clearTimeout(t);
    } else {
      Animated.timing(slideAnim, { toValue: -100, duration: 250, useNativeDriver: true }).start(() => setShow(false));
    }
  }, [visible]);

  if (!show) return null;

  const bgColor = (() => {
    switch (type) {
      case 'success': return colors.status.success;
      case 'error': return colors.status.error;
      case 'warning': return colors.status.warning;
      default: return colors.brand.primary.base;
    }
  })();

  return (
    <Animated.View style={[styles.toast, { backgroundColor: bgColor, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginHorizontal: 16, marginTop: 64, alignItems: 'center' },
  text: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});