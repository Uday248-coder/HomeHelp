import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function BottomSheet({ visible, onClose, title, children, style }: Props) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: colors.surface.primary }, style]}>
          {title ? (
            <View style={styles.handle}>
              <Text style={[styles.handleBar, { backgroundColor: colors.border.base }]} />
              <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
            </View>
          ) : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12 },
  handle: { alignItems: 'center', marginBottom: 16 },
  handleBar: { width: 40, height: 4, borderRadius: 2 },
  title: { fontSize: 17, fontWeight: '600', marginTop: 8 },
});