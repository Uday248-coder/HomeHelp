import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors, fontSize } from '../../src/constants/theme';

const TAB_ICONS: Record<string, string> = {
  index: '🏠',
  jobs: '📋',
  'active-job': '⚡',
  earnings: '💰',
  profile: '👤',
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarIcon: ({ color, route }) => (
          <Text style={{ fontSize: 22, opacity: color === colors.primary ? 1 : 0.5 }}>
            {TAB_ICONS[route.name] || '📄'}
          </Text>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Available Jobs',
          tabBarLabel: 'Jobs',
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarLabel: 'Earnings',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}
