import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors, spacing, fonts, borderRadius, shadows } from '../../src/constants/theme';
import { api } from '../../src/api/client';
import { Booking } from '../../src/types';
import { useLocalSearchParams, useRouter } from 'expo-router';

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
  assigned: { bg: '#dbeafe', text: '#1e40af', label: 'Assigned' },
  in_progress: { bg: '#d1fae5', text: '#065f46', label: 'In Progress' },
  completed: { bg: '#f3f4f6', text: '#374151', label: 'Completed' },
  cancelled: { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled' },
};

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(val?: number) {
  if (val == null) return '—';
  return `₹${val}`;
}

function RatingStars({ rating, editable, onRate }: { rating?: number; editable?: boolean; onRate?: (n: number) => void }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity
          key={n}
          onPress={() => editable && onRate?.(n)}
          disabled={!editable}
        >
          <Text style={[styles.star, n <= (rating || 0) && styles.starFilled]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [localRating, setLocalRating] = useState(0);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  async function fetchBooking() {
    setLoading(true);
    try {
      const data = await api.getBooking(id);
      setBooking(data);
      setLocalRating(data.ratingByUser || 0);
    } catch {
      Alert.alert('Error', 'Failed to load booking details');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await api.cancelBooking(id);
            await fetchBooking();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  }

  async function handleRate(n: number) {
    setLocalRating(n);
    // Future: implement rating on API
  }

  function handleBookAgain() {
    router.replace('/');
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!booking) return null;

  const statusStyle = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.statusSection}>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {statusStyle.label}
          </Text>
        </View>
        <Text style={styles.modeLabel}>
          {booking.mode === 'home_help' ? '🧹 Home Help' : '🚗 Driver'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{booking.serviceType}</Text>

        <DetailRow label="Booking ID" value={booking.id.slice(0, 8)} />
        <DetailRow label="Address" value={booking.customerAddress || '—'} />
        <DetailRow label="Scheduled" value={formatDate(booking.scheduledAt)} />
        <DetailRow label="Started" value={formatDate(booking.startedAt)} />
        <DetailRow label="Completed" value={formatDate(booking.completedAt)} />
        <DetailRow label="Duration" value={booking.durationHours ? `${booking.durationHours}h` : '—'} />
        <DetailRow label="Hourly Rate" value={formatCurrency(booking.hourlyRate)} />
        <DetailRow label="Total Amount" value={formatCurrency(booking.totalAmount)} />
        <DetailRow label="Booked On" value={formatDate(booking.createdAt)} />
      </View>

      {booking.worker && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Worker</Text>
          <DetailRow label="Name" value={booking.worker.name} />
          <DetailRow label="Phone" value={booking.worker.phoneNumber} />
        </View>
      )}

      {booking.status === 'completed' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rate Your Experience</Text>
          <RatingStars rating={localRating} editable onRate={handleRate} />
        </View>
      )}

      <View style={styles.actionSection}>
        {booking.status === 'pending' && (
          <TouchableOpacity
            style={[styles.cancelButton, actionLoading && styles.buttonDisabled]}
            onPress={handleCancel}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
            )}
          </TouchableOpacity>
        )}
        {booking.status === 'completed' && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleBookAgain}>
            <Text style={styles.primaryButtonText}>Book Again</Text>
          </TouchableOpacity>
        )}
      </View>
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
    paddingBottom: spacing.xxl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightSemiBold,
  },
  modeLabel: {
    fontSize: fonts.sizeMd,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardTitle: {
    fontSize: fonts.sizeXl,
    fontWeight: fonts.weightBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: fonts.sizeMd,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightMedium,
    color: colors.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  star: {
    fontSize: 32,
    color: colors.border,
  },
  starFilled: {
    color: '#f59e0b',
  },
  actionSection: {
    marginTop: spacing.md,
  },
  cancelButton: {
    height: 52,
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: fonts.sizeLg,
    fontWeight: fonts.weightSemiBold,
    color: colors.white,
  },
  primaryButton: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  primaryButtonText: {
    fontSize: fonts.sizeLg,
    fontWeight: fonts.weightSemiBold,
    color: colors.white,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
