import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, shadow } from '../../src/constants/theme';
import { api } from '../../src/api/client';
import { Booking } from '../../src/types';

export default function JobsScreen() {
  const [jobs, setJobs] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      const data = await api.getAvailableJobs();
      setJobs(Array.isArray(data) ? data : data.bookings || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleAccept(bookingId: string) {
    setAcceptingId(bookingId);
    try {
      await api.acceptJob(bookingId);
      Alert.alert('Accepted', 'You have accepted this job!');
      setJobs((prev) => prev.filter((j) => j.id !== bookingId));
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to accept job');
    } finally {
      setAcceptingId(null);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadJobs();
  }

  function getModeIcon(mode: string) {
    return mode === 'driver' ? '🚗' : '🧹';
  }

  function renderJob({ item }: { item: Booking }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.modeIcon}>{getModeIcon(item.mode)}</Text>
          <View style={styles.cardHeaderText}>
            <Text style={styles.serviceType}>{item.serviceType}</Text>
            <Text style={styles.modeLabel}>{item.mode === 'driver' ? 'Driver' : 'Home Help'}</Text>
          </View>
        </View>

        {item.customerAddress ? (
          <Text style={styles.address} numberOfLines={2}>
            📍 {item.customerAddress}
          </Text>
        ) : null}

        <View style={styles.detailsRow}>
          {item.durationHours ? (
            <Text style={styles.detail}>⏱ {item.durationHours}h</Text>
          ) : null}
          {item.hourlyRate ? (
            <Text style={styles.detail}>💰 ₹{item.hourlyRate}/hr</Text>
          ) : null}
          {item.scheduledAt ? (
            <Text style={styles.detail}>
              📅 {new Date(item.scheduledAt).toLocaleDateString()}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.acceptBtn,
            acceptingId === item.id && styles.acceptBtnDisabled,
          ]}
          onPress={() => handleAccept(item.id)}
          disabled={acceptingId === item.id}
        >
          {acceptingId === item.id ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.acceptBtnText}>Accept Job</Text>
          )}
        </TouchableOpacity>
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
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJob}
        contentContainerStyle={jobs.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No jobs available</Text>
            <Text style={styles.emptySub}>Check back later for new opportunities</Text>
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
    paddingTop: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modeIcon: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  cardHeaderText: {
    flex: 1,
  },
  serviceType: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  modeLabel: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  address: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detail: {
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  acceptBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  acceptBtnDisabled: {
    opacity: 0.7,
  },
  acceptBtnText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
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
