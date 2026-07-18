import React from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Text } from 'react-native';
import Ionic from '@expo/vector-icons/Ionicons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { lightColors, darkColors, fonts, radius, shadows, spacing } from '../theme/tokens';
import { useReducedMotion } from '../hooks/useReducedMotion';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
  showHandle?: boolean;
  bottomInset?: number;
  isDark?: boolean;
  /**
   * Optional primary CTA rendered in a fixed bottom bar inside the sheet.
   */
  primaryAction?: React.ReactNode;
}

const SCREEN_H = Dimensions.get('window').height;

export function BottomSheet(props: BottomSheetProps) {
  const {
    visible, onClose, title, description, children,
    closeOnBackdrop = true, showHandle = true,
    isDark = false, primaryAction,
  } = props;
  const colors = isDark ? darkColors : lightColors;
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const translate = useSharedValue(SCREEN_H);
  const overlayOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      translate.value = reduce ? 0 : withSpring(0, { damping: 22, stiffness: 240, mass: 0.9 });
      overlayOpacity.value = reduce ? 1 : withTiming(1, { duration: 200 });
    } else {
      translate.value = reduce ? SCREEN_H : withSpring(SCREEN_H, { damping: 24, stiffness: 260 });
      overlayOpacity.value = reduce ? 0 : withTiming(0, { duration: 180 });
    }
  }, [visible, reduce, translate, overlayOpacity]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translate.value }],
  }));
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const bottomPad = (props.bottomInset ?? insets.bottom) + spacing.lg;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <Pressable style={styles.overlayPress} onPress={closeOnBackdrop ? onClose : undefined} accessible={false} />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, paddingBottom: bottomPad },
            sheetStyle,
          ]}
        >
          {showHandle ? <View style={[styles.handle, { backgroundColor: colors.border }]} /> : null}
          {(title || description) ? (
            <View style={styles.header}>
              {title ? (
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              ) : null}
              {description ? (
                <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
              ) : null}
            </View>
          ) : null}
          <View style={styles.body}>{children}</View>
          {primaryAction ? (
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              {primaryAction}
            </View>
          ) : null}
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close sheet"
            style={styles.closeBtn}
            hitSlop={12}
          >
            <Ionic name="close" size={18} color={colors.textMuted} />
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' } as ViewStyle,
  overlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 } as ViewStyle,
  overlayPress: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  } as ViewStyle,
  sheet: {
    position: 'relative',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.cardLifted,
  } as ViewStyle,
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 4,
    marginBottom: spacing.md,
  } as ViewStyle,
  header: { marginBottom: spacing.md } as ViewStyle,
  title: { fontFamily: fonts.display, fontSize: fonts.sizeXxl, fontWeight: '600' as any } as any,
  description: { fontSize: fonts.sizeSm, marginTop: spacing.xs } as any,
  body: { flex: 1 } as ViewStyle,
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  } as ViewStyle,
  closeBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  } as ViewStyle,
});
