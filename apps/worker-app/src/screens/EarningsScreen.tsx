import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, shadow } from '../constants/theme';
import { api } from '../api/client';
import { Payout } from '../types';

export default function EarningsScreen() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadEarnings();
    }, [])
  );

  async function loadEarnings() {
    try {
      const data = await api.getEarnings();
      setPayouts(Array.isArray(data) ? data : data.payouts || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadEarnings();
  }

  const totalEarned = payouts.reduce(
    (sum, p) => (p.status === 'processed' ? sum + p.amount : sum),
    0
  );

  const thisWeek = payouts
    .filter((p) => {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      return new Date(p.createdAt) >= startOfWeek;
    })
    .reduce((sum, p) => (p.status === 'processed' ? sum + p.amount : sum), 0);

  function getStatusStyle(status: string) {
    switch (status) {
      case 'processed':
        return { bg: colors.success + '20', text: colors.success };
      case 'pending':
        return { bg: colors.warning + '20', text: colors.warning };
      case 'failed':
        return { bg: colors.error + '20', text: colors.error };
      default:
        return { bg: colors.border, text: colors.textMuted };
    }
  }

  function renderPayout({ item }: { item: Payout }) {
    const statusStyle = getStatusStyle(item.status);
    const startDate = new Date(item.weekStart).toLocaleDateString();
    const endDate = new Date(item.weekEnd).toLocaleDateString();

    return (
      <View style={styles.payoutCard}>
        <View style={styles.payoutTop}>
          <Text style={styles.weekRange}>
            {startDate} - {endDate}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.amount}>₹{item.amount}</Text>
        {item.paidAt && (
          <Text style={styles.paidDate}>
            Paid on {new Date(item.paidAt).toLocaleDateString()}
          </Text>
        )}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>This Week</Text>
            <Text style={styles.summaryValue}>₹{thisWeek}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Earned</Text>
            <Text style={styles.summaryValue}>₹{totalEarned}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={payouts}
        keyExtractor={(item) => item.id}
        renderItem={renderPayout}
        contentContainerStyle={payouts.length === 0 ? styles.emptyContainer : styles.list}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Payout History</Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyTitle}>No earnings yet</Text>
            <Text style={styles.emptySub}>
              Complete jobs to see your earnings here
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    padding: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.primary,
    margin: spacing.md,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...shadow.card,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: spacing.md,
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.white,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  payoutCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  payoutTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  weekRange: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  amount: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  paidDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  empty: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySub: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
