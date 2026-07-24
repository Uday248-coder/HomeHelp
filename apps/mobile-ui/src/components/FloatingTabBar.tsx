import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/theme';

interface Tab {
  key: string;
  label: string;
  icon: string;
}

interface Props {
  tabs: Tab[];
  activeKey: string;
  onSwitch: (key: string) => void;
  style?: ViewStyle;
}

export function FloatingTabBar({ tabs, activeKey, onSwitch, style }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.bar, { backgroundColor: colors.surface.primary }, style]}>
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <TouchableOpacity key={tab.key} onPress={() => onSwitch(tab.key)} style={styles.tab}>
            <Text style={styles.icon}>{tab.icon}</Text>
            <Text style={[styles.label, { color: active ? colors.brand.primary.base : colors.text.tertiary }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 8, paddingBottom: 24, borderTopWidth: 1, borderTopColor: '#CDD3CE' },
  tab: { alignItems: 'center', gap: 4 },
  icon: { fontSize: 22 },
  label: { fontSize: 11, fontWeight: '500' },
});