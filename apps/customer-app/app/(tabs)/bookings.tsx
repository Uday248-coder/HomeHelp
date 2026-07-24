import { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { api } from '../src/api/client';
import { Screen, ScreenHeader, Card, Button, StatusBadge, LoadingView, EmptyState } from 'homehelp-mobile-ui';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function BookingItem({ item, onPress }: { item: any; onPress: (id: string) => void }) {
  return (
    <Card style={styles.bookingCard} onPress={() => onPress(item.id)}>
      <View style={styles.bookingHeader}>
        <Text style={styles.serviceType}>{item.serviceType}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.modeText}>{item.mode === 'home_help' ? 'Home Help' : 'Driver'}</Text>
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
    </Card>
  );
}

export default function BookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const data = await api.getBookings();
      setBookings(Array.isArray(data) ? data : data.bookings || []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  function handleRefresh() { setRefreshing(true); fetchBookings(); }

  function handlePress(id: string) { router.push(`/booking/${id}`); }

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0EAA6F" />}
        ListEmptyComponent={<EmptyState icon="📋" title="No bookings yet" message="Your upcoming service bookings will appear here." />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 16, paddingTop: 0, paddingBottom: 48 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  bookingCard: { marginBottom: 12 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  serviceType: { fontSize: 16, fontWeight: '600', color: '#1A2C2B', flex: 1, marginRight: 8 },
  modeText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  bookingDetails: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#CDD3CE' },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 10, color: '#6B7280', fontWeight: '600', marginBottom: 2, textTransform: 'uppercase' },
  detailValue: { fontSize: 13, color: '#1A2C2B', fontWeight: '500' },
  amountContainer: { alignItems: 'flex-end' },
  amountLabel: { fontSize: 10, color: '#6B7280', fontWeight: '600', marginBottom: 2, textTransform: 'uppercase' },
  amountText: { fontSize: 14, fontWeight: '700', color: '#0EAA6F' },
});