import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { colors, spacing, borderRadius, fonts, shadows } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/api/client';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();
  const { worker, logout } = useAuth();
  const [isAvailable, setIsAvailable] = useState(worker?.isAvailable ?? false);
  const [stats, setStats] = useState({ totalJobs: 0, rating: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
    { label: 'Earnings', value: `₹${stats.earnings}`, color: colors.primary },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{worker?.name || 'Worker'}</Text>
          </View>
          <View style={styles.profilePlaceholder} />
        </View>

        <View style={styles.availabilityCard}>
          <View style={styles.availabilityRow}>
            <View style={styles.availInfo}>
              <Text style={styles.availLabel}>Work Status</Text>
              <Text style={[styles.availStatus, isAvailable && styles.statusOnline]}>
                {toggling ? 'Updating...' : isAvailable ? 'Available for jobs' : 'Currently offline'}
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

        <Text style={styles.sectionTitle}>Your Performance</Text>
        <View style={styles.statsGrid}>
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
          style={styles.primaryButton}
          onPress={() => router.push('/(tabs)/jobs')}
        >
          <Text style={styles.primaryButtonText}>Find Available Jobs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: fonts.sizeMd,
    color: colors.textMuted,
  },
  userName: {
    fontSize: fonts.sizeXxl,
    fontWeight: fonts.weightBold,
    color: colors.text,
  },
  profilePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    opacity: 0.2,
  },
  availabilityCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availInfo: {
    flex: 1,
  },
  availLabel: {
    fontSize: fonts.sizeSm,
    fontWeight: fonts.weightSemiBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  availStatus: {
    fontSize: fonts.sizeLg,
    fontWeight: fonts.weightBold,
    color: colors.text,
    marginTop: 4,
  },
  statusOnline: {
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: fonts.sizeLg,
    fontWeight: fonts.weightSemiBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  statValue: {
    fontSize: fonts.sizeXl,
    fontWeight: fonts.weightBold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: fonts.sizeSm,
    color: colors.textMuted,
    fontWeight: fonts.weightMedium,
  },
  primaryButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fonts.sizeLg,
    fontWeight: fonts.weightBold,
  },
  logoutButton: {
    marginTop: spacing.xl,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: '#FEE2E2',
  },
  logoutText: {
    color: colors.error,
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightBold,
  },
});

(End of file - total 217 lines)
