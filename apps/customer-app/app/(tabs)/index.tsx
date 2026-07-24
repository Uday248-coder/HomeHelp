import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { ScreenScroll, ScreenHeader, Card, Button, TextField, SegmentedControl, Chip } from 'homehelp-mobile-ui';
import { api } from '../src/api/client';

const SERVICE_OPTIONS: Record<string, { label: string; description: string; options: string[] }> = {
  home_help: {
    label: 'Home Help',
    description: 'Professional cleaning and domestic assistance',
    options: ['Full Home Cleaning', 'Kitchen Deep Clean', 'Bathroom Scrub', 'Living Room Tidy-up'],
  },
  driver: {
    label: 'Driver',
    description: 'Experienced drivers for your own vehicle',
    options: ['Local Trip', 'Airport Transfer', 'Shopping Run', 'Outstation Trip'],
  },
};

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'home_help' | 'driver'>('home_help');
  const [serviceType, setServiceType] = useState(SERVICE_OPTIONS.home_help.options[0]);
  const [address, setAddress] = useState('');
  const [duration, setDuration] = useState(2);
  const [scheduleNow, setScheduleNow] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleBook() {
    if (!address.trim()) {
      Alert.alert('Address Required', 'Please enter your service address.');
      return;
    }
    setLoading(true);
    try {
      const booking = await api.createBooking({
        mode,
        serviceType,
        customerAddress: address,
        durationHours: duration,
        scheduledAt: scheduleNow ? undefined : new Date(Date.now() + 86400000).toISOString(),
      });
      router.push(`/booking/${booking.booking.id}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenScroll>
      <ScreenHeader title={`Hi, ${user?.name?.split(' ')[0] || 'there'}`} subtitle="What do you need help with today?" />

      <Card>
        <View style={styles.sectionTitle}>Choose a Service</View>
        <View style={styles.modeGrid}>
          {(['home_help', 'driver'] as const).map((m) => {
            const active = mode === m;
            return (
              <TouchableOpacity key={m} style={[styles.modeCard, active && styles.modeCardActive]} onPress={() => { setMode(m); setServiceType(SERVICE_OPTIONS[m].options[0]); }}>
                <Text style={styles.modeIcon}>{m === 'home_help' ? '🏠' : '🚗'}</Text>
                <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>{SERVICE_OPTIONS[m].label}</Text>
                <Text style={styles.modeDesc}>{SERVICE_OPTIONS[m].description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionTitle}>Service Type</View>
        <View style={styles.optionsGrid}>
          {SERVICE_OPTIONS[mode].options.map((opt) => (
            <Chip key={opt} label={opt} active={serviceType === opt} onPress={() => setServiceType(opt)} />
          ))}
        </View>

        <TextField label="Service Address" placeholder="Enter full address, including landmark" value={address} onChangeText={setAddress} multiline />

        <View style={styles.sectionTitle}>Duration (hours)</View>
        <View style={styles.optionsGrid}>
          {[1, 2, 3, 4, 6, 8].map((h) => (
            <Chip key={h} label={`${h}h`} active={duration === h} onPress={() => setDuration(h)} />
          ))}
        </View>

        <View style={styles.sectionTitle}>Schedule</View>
        <View style={styles.scheduleRow}>
          <Chip label="Immediate" active={scheduleNow} onPress={() => setScheduleNow(true)} />
          <Chip label="Scheduled" active={!scheduleNow} onPress={() => setScheduleNow(false)} />
        </View>

        <Button title="Confirm Booking" onPress={handleBook} loading={loading} />
      </Card>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#1A2C2B', marginBottom: 12, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  modeGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  modeCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 14, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  modeCardActive: { borderColor: '#0EAA6F' },
  modeIcon: { fontSize: 26, marginBottom: 8 },
  modeLabel: { fontSize: 14, fontWeight: '600', color: '#6B7280', textAlign: 'center' },
  modeLabelActive: { color: '#0EAA6F' },
  modeDesc: { fontSize: 11, color: '#6B7280', textAlign: 'center', marginTop: 4, lineHeight: 14 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  scheduleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
});