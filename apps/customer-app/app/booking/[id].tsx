import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, Linking, StyleSheet, TouchableOpacity } from 'react-native';
import QRCodeSvg from 'react-native-qrcode-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../src/api/client';
import { Screen, Card, Button, StatusBadge, LoadingView, TextField } from 'homehelp-mobile-ui';
import MapView, { Marker } from 'react-native-maps';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtCurrency(val?: number) {
  if (val == null) return '—';
  return `₹${val}`;
}

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => { fetchBooking(); }, [id]);

  async function fetchBooking() {
    setLoading(true);
    try {
      const data = await api.getBooking(id);
      setBooking(data);
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
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => { setActionLoading(true); try { await api.cancelBooking(id); fetchBooking(); } catch (err: any) { Alert.alert('Error', err.message); } finally { setActionLoading(false); } } },
    ]);
  }

  async function handlePayment() {
    setActionLoading(true);
    try {
      const res: any = await api.createPaymentOrder(id);
      const upiInfo = res?.upi;
      if (!upiInfo?.link) {
        Alert.alert('Payment Unavailable', 'UPI payment is not set up yet. Please contact support.');
        setActionLoading(false);
        return;
      }
      try { await Linking.openURL(upiInfo.link); } catch { Alert.alert('Could not open UPI app', 'Please scan the QR code instead.'); }
    } catch (err: any) {
      Alert.alert('Payment Error', err?.message || 'Failed to initiate payment');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <Screen>
        <LoadingView message="Loading booking…" />
      </Screen>
    );
  }
  if (!booking) return null;

  const workerLat = booking?.worker?.currentLat;
  const workerLng = booking?.worker?.currentLng;
  const showWorkerLocation = typeof workerLat === 'number' && typeof workerLng === 'number';

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusSection}>
          <StatusBadge status={booking.status} />
        </View>

        <Card>
          <Text style={styles.cardTitle}>{booking.serviceType}</Text>
          <DetailRow label="Booking ID" value={booking.id.slice(0, 8)} />
          <DetailRow label="Address" value={booking.customerAddress || '—'} />
          <DetailRow label="Scheduled" value={formatDate(booking.scheduledAt)} />
          <DetailRow label="Started" value={formatDate(booking.startedAt)} />
          <DetailRow label="Completed" value={formatDate(booking.completedAt)} />
          <DetailRow label="Duration" value={booking.durationHours ? `${booking.durationHours}h` : '—'} />
          <DetailRow label="Total Amount" value={fmtCurrency(booking.totalAmount)} />
          <DetailRow label="Booked On" value={formatDate(booking.createdAt)} />
        </Card>

        {booking.worker && (
          <Card>
            <Text style={styles.cardTitle}>Worker</Text>
            <DetailRow label="Name" value={booking.worker.name} />
            {showWorkerLocation ? (
              <TouchableOpacity onPress={() => setShowMap(true)}>
                <DetailRow label="Location" value="📍 Live — tap to view" />
              </TouchableOpacity>
            ) : null}
          </Card>
        )}

        {showMap && (showWorkerLocation) && (
          <Card>
            <Text style={styles.cardTitle}>Worker Location</Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: Number(workerLat),
                longitude: Number(workerLng),
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
            >
              <Marker coordinate={{ latitude: Number(workerLat), longitude: Number(workerLng) }} title="Worker" />
            </MapView>
          </Card>
        )}

        {booking.status === 'assigned' && !showWorkerLocation && (
          <Card>
            <Text style={styles.cardTitle}>Share OTP with Worker</Text>
            <Text style={styles.otpHint}>Start OTP generated — share this code with your worker to begin the job.</Text>
          </Card>
        )}

        {booking.status === 'pending' && !booking.payment && (
          <Card>
            <Button title="Confirm Booking" onPress={handlePayment} loading={actionLoading} />
          </Card>
        )}

        {booking.status === 'pending' && (
          <View style={styles.actionRow}>
            <Button title="Cancel Booking" onPress={handleCancel} loading={actionLoading} variant="secondary" style={styles.cancelBtn} />
          </View>
        )}

        {booking.status === 'completed' && (
          <Button title="Book Again" onPress={() => router.replace('/(tabs)')} />
        )}
      </ScrollView>
    </Screen>
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

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48 },
  statusSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#1A2C2B', marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#CDD3CE' },
  detailLabel: { fontSize: 13, color: '#6B7280' },
  detailValue: { fontSize: 13, fontWeight: '500', color: '#1A2C2B', maxWidth: '60%', textAlign: 'right' },
  map: { width: '100%', height: 180, borderRadius: 12 },
  otpHint: { fontSize: 13, color: '#6B7280' },
  actionRow: { marginTop: 12 },
  cancelBtn: { marginTop: 12 },
});