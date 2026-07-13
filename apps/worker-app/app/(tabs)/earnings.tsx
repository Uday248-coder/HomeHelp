import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { colors, spacing, fonts, borderRadius, shadows } from '../../src/constants/theme';
import { api } from '../../src/api/client';
import { Payout } from '../../src/types';
import { Screen, ScreenHeader, Card, LoadingView, EmptyState } from '../../src/components/ui';

const PAYOUT_STATUS: Record<string, { color: string; label: string }> = {
  processed: { color: colors.success, label: 'Paid' },
  pending: { color: colors.warning, label: 'Pending' },
  failed: { color: colors.error, label: 'Failed' },
};

export default function EarningsScreen() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEarnings();
  }, []);

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

  function renderPayout({ item }: { item: Payout }) {
    const status = PAYOUT_STATUS[item.status] || PAYOUT_STATUS.pending;
    const startDate = new Date(item.weekStart).toLocaleDateString();
    const endDate = new Date(item.weekEnd).toLocaleDateString();

    return (
      <Card style={styles.payoutCard}>
        <View style={styles.payoutTop}>
          <Text style={styles.weekRange}>
            {startDate} – {endDate}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '1A', borderColor: status.color + '40' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <Text style={styles.amount}>₹{item.amount}</Text>
        {item.paidAt && (
          <Text style={styles.paidDate}>
            Paid on {new Date(item.paidAt).toLocaleDateString()}
          </Text>
        )}
      </Card>
    );
  }

  if (loading) {
    return (
      <Screen>
        <LoadingView message="Loading your earnings..." />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Earnings" subtitle="Track your weekly payouts" />

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
        ListHeaderComponent={<Text style={styles.sectionTitle}>Payout History</Text>}
        ListEmptyComponent={
          <EmptyState
            icon="💰"
            title="No earnings yet"
            message="Complete jobs to see your earnings here"
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  summaryCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.button,
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
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: spacing.md,
  },
  summaryLabel: {
    fontSize: fonts.sizeSm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: fonts.sizeXxl,
    fontWeight: fonts.weightBold,
    color: colors.white,
  },
  sectionTitle: {
    fontSize: fonts.sizeLg,
    fontWeight: fonts.weightSemiBold,
    color: colors.text,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
  },
  payoutCard: {
    marginBottom: spacing.sm,
  },
  payoutTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  weekRange: {
    fontSize: fonts.sizeSm,
    color: colors.text,
    fontWeight: fonts.weightMedium,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  statusText: {
    fontSize: fonts.sizeXs,
    fontWeight: fonts.weightSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  amount: {
    fontSize: fonts.sizeXxl,
    fontWeight: fonts.weightBold,
    color: colors.text,
  },
  paidDate: {
    fontSize: fonts.sizeXs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
