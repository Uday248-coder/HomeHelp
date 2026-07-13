import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { colors, spacing, fonts, borderRadius, shadows } from '../../src/constants/theme';
import { api } from '../../src/api/client';
import { Booking } from '../../src/types';
import { useRouter } from 'expo-router';
import { Screen, ScreenHeader, StatusBadge, LoadingView, EmptyState } from '../../src/components/ui';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function BookingItem({ item, onPress }: { item: Booking; onPress: (id: string) => void }) {
  return (
    <TouchableOpacity style={styles.bookingCard} onPress={() => onPress(item.id)} activeOpacity={0.92}>
      <View style={styles.bookingHeader}>
        <Text style={styles.serviceType}>{item.serviceType}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.modeText}>
        {item.mode === 'home_help' ? 'Home Help' : 'Driver'}
      </Text>
      <View style={styles.bookingDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Booked</Text>
          <Text style={styles.detailValue}>{formatDate(item.createdAt)}</Text>
        </View>
        {item.durationHours ? (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{item.durationHours}h</Text>
          </View>
        ) : null}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountText}>₹{item.totalAmount ?? '0'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function BookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const data = await api.getBookings();
      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  function handleRefresh() {
    setRefreshing(true);
    fetchBookings();
  }

  function handlePress(id: string) {
    router.push({ pathname: '/booking/[id]', params: { id } });
  }

  if (loading) {
    return (
      <Screen>
        <LoadingView message="Loading your bookings…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="My Bookings" subtitle="Track your service requests" />
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookingItem item={item} onPress={handlePress} />}
        contentContainerStyle={bookings.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="📋"
            title="No bookings yet"
            message="Your upcoming service bookings will appear here."
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.lg,
    paddingTop: 0,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  bookingCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  serviceType: {
    fontSize: fonts.sizeLg,
    fontWeight: fonts.weightBold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  modeText: {
    fontSize: fonts.sizeSm,
    color: colors.textMuted,
    fontWeight: fonts.weightMedium,
  },
  bookingDetails: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailItem: { flex: 1 },
  detailLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: fonts.weightSemiBold,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: fonts.sizeSm,
    color: colors.text,
    fontWeight: fonts.weightMedium,
  },
  amountContainer: { alignItems: 'flex-end' },
  amountLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: fonts.weightSemiBold,
    marginBottom: 2,
  },
  amountText: {
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightBold,
    color: colors.primary,
  },
});
