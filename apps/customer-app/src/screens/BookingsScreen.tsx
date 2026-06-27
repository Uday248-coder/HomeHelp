import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { colors, spacing, fonts, borderRadius, shadows } from '../constants/theme';
import { api } from '../api/client';
import { Booking } from '../types';

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
  assigned: { bg: '#dbeafe', text: '#1e40af', label: 'Assigned' },
  in_progress: { bg: '#d1fae5', text: '#065f46', label: 'In Progress' },
  completed: { bg: '#f3f4f6', text: '#374151', label: 'Completed' },
  cancelled: { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function BookingItem({
  item,
  onPress,
}: {
  item: Booking;
  onPress: (id: string) => void;
}) {
  const statusStyle = STATUS_COLORS[item.status] || STATUS_COLORS.pending;

  return (
    <TouchableOpacity style={styles.bookingCard} onPress={() => onPress(item.id)}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingTitleRow}>
          <Text style={styles.serviceType}>{item.serviceType}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>
        <Text style={styles.modeText}>
          {item.mode === 'home_help' ? '🧹 Home Help' : '🚗 Driver'}
        </Text>
      </View>

      <View style={styles.bookingDetails}>
        <Text style={styles.detailText}>📅 {formatDate(item.createdAt)}</Text>
        {item.durationHours && (
          <Text style={styles.detailText}>⏱ {item.durationHours}h</Text>
        )}
        {item.totalAmount != null && (
          <Text style={styles.amountText}>₹{item.totalAmount}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function BookingsScreen({ navigation }: any) {
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

  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', fetchBookings);
    return unsubscribe;
  }, [navigation, fetchBookings]);

  function handleRefresh() {
    setRefreshing(true);
    fetchBookings();
  }

  function handlePress(id: string) {
    navigation.navigate('BookingDetail', { bookingId: id });
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
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptySubtitle}>
              Book a home help or driver service to get started
            </Text>
          </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  bookingCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  bookingHeader: {
    marginBottom: spacing.sm,
  },
  bookingTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  serviceType: {
    fontSize: fonts.sizeLg,
    fontWeight: fonts.weightSemiBold,
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  statusText: {
    fontSize: fonts.sizeSm,
    fontWeight: fonts.weightMedium,
  },
  modeText: {
    fontSize: fonts.sizeSm,
    color: colors.textMuted,
  },
  bookingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  detailText: {
    fontSize: fonts.sizeSm,
    color: colors.textMuted,
  },
  amountText: {
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightBold,
    color: colors.text,
    marginLeft: 'auto',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fonts.sizeXl,
    fontWeight: fonts.weightBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: fonts.sizeMd,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
