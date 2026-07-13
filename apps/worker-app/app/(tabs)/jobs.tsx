import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { colors, spacing, fonts, borderRadius } from '../../src/constants/theme';
import { api } from '../../src/api/client';
import { Booking } from '../../src/types';
import { Screen, ScreenHeader, Card, Button, LoadingView, EmptyState } from '../../src/components/ui';

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
      <Card style={styles.card}>
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

        <Button
          title={acceptingId === item.id ? 'Accepting...' : 'Accept Job'}
          onPress={() => handleAccept(item.id)}
          loading={acceptingId === item.id}
          disabled={acceptingId === item.id}
        />
      </Card>
    );
  }

  if (loading) {
    return (
      <Screen>
        <LoadingView message="Finding jobs near you..." />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Available Jobs" subtitle="Pick up a shift near you" />
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={renderJob}
        contentContainerStyle={jobs.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="📭"
            title="No jobs available"
            message="Check back later for new opportunities"
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
  card: {
    marginBottom: spacing.md,
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
    fontSize: fonts.sizeLg,
    fontWeight: fonts.weightBold,
    color: colors.text,
  },
  modeLabel: {
    fontSize: fonts.sizeXs,
    color: colors.primary,
    fontWeight: fonts.weightSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  address: {
    fontSize: fonts.sizeSm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detail: {
    fontSize: fonts.sizeSm,
    color: colors.text,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
});
