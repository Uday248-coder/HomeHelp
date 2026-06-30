import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, shadow } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function DashboardScreen({ navigation }: any) {
  const { worker, logout } = useAuth();
  const [isAvailable, setIsAvailable] = useState(worker?.isAvailable ?? false);
  const [stats, setStats] = useState({ totalJobs: 0, rating: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  async function loadStats() {
    try {
      const [jobsRes, earningsRes] = await Promise.allSettled([
        api.getMyJobs(),
        api.getEarnings(),
      ]);

      const jobs = jobsRes.status === 'fulfilled' ? jobsRes.value : [];
      const earnings = earningsRes.status === 'fulfilled' ? earningsRes.value : [];

      setStats({
        totalJobs: Array.isArray(jobs) ? jobs.length : 0,
        rating: worker?.averageRating ?? 0,
        earnings: Array.isArray(earnings)
          ? earnings.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
          : 0,
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleToggle(val: boolean) {
    setToggling(true);
    try {
      await api.toggleAvailability(val);
      setIsAvailable(val);
    } catch {
      // revert
    } finally {
      setToggling(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadStats();
  }

  const statCards = [
    { label: 'Total Jobs', value: String(stats.totalJobs), color: colors.primary },
    { label: 'Rating', value: stats.rating > 0 ? stats.rating.toFixed(1) : '—', color: colors.secondary },
    { label: 'Earnings', value: `₹${stats.earnings}`, color: colors.success },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Text style={styles.greeting}>Welcome, {worker?.name || 'Worker'}</Text>

      <View style={styles.availabilityCard}>
        <View style={styles.availabilityRow}>
          <View>
            <Text style={styles.availLabel}>Available for Jobs</Text>
            <Text style={styles.availStatus}>
              {toggling ? 'Updating...' : isAvailable ? 'You are online' : 'You are offline'}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={handleToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
            disabled={toggling}
          />
        </View>
      </View>

      <View style={styles.statsRow}>
        {statCards.map((card, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={[styles.statValue, { color: card.color }]}>
              {loading ? '...' : card.value}
            </Text>
            <Text style={styles.statLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.findJobsBtn}
        onPress={() => navigation.navigate('Jobs')}
      >
        <Text style={styles.findJobsText}>Find Jobs</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  availabilityCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  availStatus: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadow.card,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  findJobsBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadow.button,
  },
  findJobsText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  logoutBtn: {
    marginTop: spacing.lg,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
