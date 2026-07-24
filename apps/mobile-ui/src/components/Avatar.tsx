import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme';

interface Props {
  name?: string;
  photoUrl?: string;
  size?: number;
  style?: ViewStyle;
}

export function Avatar({ name, photoUrl, size = 44, style }: Props) {
  const { colors } = useTheme();
  const initials = (name ?? '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  if (photoUrl) {
    return <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, style]} />;
  }

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.brand.primary.base }, style]}>
      <Text style={[styles.avatarText, { color: colors.text.onAccent, fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700' },
});