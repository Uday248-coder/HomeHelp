import { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { api } from '../src/api/client';
import { Screen, ScreenHeader, Card, Button, StatusBadge, LoadingView, EmptyState, OTPInput } from 'homehelp-mobile-ui';

export default function JobsScreen() {
  const router = useRouter();
  const { worker } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [otp, setOtp] = useState('');

  const fetchJobs = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await api.getMyJobs();
      const active = (Array.isArray(data) ? data : data.bookings || []).filter(
        (b: any) => b.status === 'assigned' || b.status === 'in_progress'
      );
      setJobs(active);
    } catch {} finally { setRefreshing(false); setLoading(false); }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  function onRefresh() { setRefreshing(true); fetchJobs(); }

  function handleStart(job: any) {
    setSelectedJob(job);
    setOtp('');
  }

  async function confirmStart() {
    if (!otp.trim()) return;
    try { await api.startJob(selectedJob.id, otp); setSelectedJob(null); setOtp(''); fetchJobs(); } catch (err: any) { Alert.alert('Error', err.message); }
  }

  if (loading) return <Screen><LoadingView message="Loading jobs…" /></Screen>;

  return (
    <Screen>
      <ScreenHeader title="Jobs" subtitle="Accept and manage your jobs" />
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.serviceType}>{item.serviceType}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.address}>📍 {item.customerAddress || '—'}</Text>
            <Text style={styles.detail}>{item.mode === 'driver' ? '🚗 Driver' : '🏠 Home Help'} · {item.durationHours ? `${item.durationHours}h` : ''} · ₹{item.totalAmount ?? '0'}</Text>
            {item.status === 'assigned' ? (
              <Button title="Start Job" onPress={() => handleStart(item)} />
            ) : null}
          </Card>
        )}
        contentContainerStyle={jobs.length === 0 ? styles.emptyContainer : styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0EAA6F" />}
        ListEmptyComponent={<EmptyState icon="🔍" title="No jobs" message="Accept a job to get started" />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  card: { marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  serviceType: { fontSize: 16, fontWeight: '600', color: '#1A2C2B', flex: 1 },
  address: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  detail: { fontSize: 12, color: '#6B7280', marginBottom: 10 },
});