import { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { api } from '../src/api/client';
import { ScreenScroll, ScreenHeader, Card, Button, MetricCard } from 'homehelp-mobile-ui';

export default function DashboardScreen() {
  const router = useRouter();
  const { worker, logout } = useAuth();
  const [stats, setStats] = useState({ totalJobs: 0, rating: 0, earnings: 0 });
  const [isAvailable, setIsAvailable] = useState(worker?.isAvailable ?? false);

  async function loadStats() {
    try {
      const [jobsRes, earningsRes] = await Promise.allSettled([api.getMyJobs(), api.getEarnings()]);
      const jobs = jobsRes.status === 'fulfilled' ? jobsRes.value : [];
      const earnings = earningsRes.status === 'fulfilled' ? earningsRes.value : [];
      setStats({
        totalJobs: Array.isArray(jobs) ? jobs.length : 0,
        rating: worker?.averageRating ?? 0,
        earnings: Array.isArray(earnings) ? earnings.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) : 0,
      });
    } catch {}
  }

  useEffect(() => { loadStats(); }, []);

  async function handleToggle(val: boolean) {
    try { await api.toggleAvailability(val); setIsAvailable(val); } catch {}
  }

  return (
    <ScreenScroll>
      <ScreenHeader title={`Hi, ${worker?.name?.split(' ')[0] || 'Partner'}`} subtitle="Work & earnings at a glance" right={<View style={styles.avatar}><Text style={styles.avatarText}>{worker?.name?.charAt(0)?.toUpperCase() ?? 'W'}</Text></View>} />

      <Card>
        <View style={styles.availabilityRow}>
          <View>
            <Text style={styles.availLabel}>Work Status</Text>
            <Text style={[styles.availStatus, isAvailable && styles.statusOnline]}>{isAvailable ? 'Available for jobs' : 'Currently offline'}</Text>
          </View>
          <Switch value={isAvailable} onValueChange={handleToggle} trackColor={{ false: '#CDD3CE', true: '#0EAA6F' }} thumbColor="#FFFFFF" />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Your Performance</Text>
      <View style={styles.statsGrid}>
        <MetricCard label="Total Jobs" value={String(stats.totalJobs)} />
        <MetricCard label="Rating" value={stats.rating > 0 ? stats.rating.toFixed(1) : '—'} color="#D4812D" />
        <MetricCard label="Earnings" value={`₹${stats.earnings}`} />
      </View>

      <Button title="Find Available Jobs" onPress={() => router.push('/(tabs)/jobs')} />
      <Button title="Sign Out" variant="ghost" onPress={logout} style={{ marginTop: 12 }} />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0EAA6F', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  availabilityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  availLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  availStatus: { fontSize: 15, fontWeight: '600', color: '#1A2C2B', marginTop: 4 },
  statusOnline: { color: '#0EAA6F' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#1A2C2B', marginBottom: 12, marginTop: 24, textTransform: 'uppercase', letterSpacing: 0.5 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
});