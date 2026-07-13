import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, fonts, borderRadius, shadows } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/api/client';
import { ScreenScroll, ScreenHeader, Card, Button, Chip } from '../../src/components/ui';

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

const DURATION_OPTIONS = [1, 2, 3, 4, 6, 8];

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
      Alert.alert('Success', 'Your booking has been created!', [
        { text: 'View Details', onPress: () => router.push(`/booking/${booking.booking.id}`) },
      ]);
      setAddress('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenScroll>
      <ScreenHeader
        title={`Hi, ${user?.name?.split(' ')[0] || 'there'}`}
        subtitle="What do you need help with today?"
      />

      <Text style={styles.sectionTitle}>Choose a Service</Text>
      <View style={styles.modeGrid}>
        {(['home_help', 'driver'] as const).map((m) => {
          const active = mode === m;
          return (
            <TouchableOpacity
              key={m}
              style={[styles.modeCard, active && styles.modeCardActive]}
              onPress={() => {
                setMode(m);
                setServiceType(SERVICE_OPTIONS[m].options[0]);
              }}
            >
              <View style={[styles.iconContainer, active && styles.iconContainerActive]}>
                <Text style={styles.modeIcon}>{m === 'home_help' ? '🏠' : '🚗'}</Text>
              </View>
              <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>
                {SERVICE_OPTIONS[m].label}
              </Text>
              <Text style={styles.modeDesc}>{SERVICE_OPTIONS[m].description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Card style={styles.bookingCard}>
        <Text style={styles.cardTitle}>Booking Details</Text>

        <Text style={styles.label}>Service Type</Text>
        <View style={styles.optionsGrid}>
          {SERVICE_OPTIONS[mode].options.map((opt) => (
            <Chip key={opt} label={opt} active={serviceType === opt} onPress={() => setServiceType(opt)} />
          ))}
        </View>

        <Text style={styles.label}>Service Address</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Enter full address, including landmark"
          placeholderTextColor={colors.textSecondary}
          value={address}
          onChangeText={setAddress}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>Duration (hours)</Text>
        <View style={styles.durationRow}>
          {DURATION_OPTIONS.map((h) => (
            <Chip key={h} label={`${h}h`} active={duration === h} onPress={() => setDuration(h)} />
          ))}
        </View>

        <Text style={styles.label}>Schedule</Text>
        <View style={styles.scheduleRow}>
          <ScheduleBtn label="Immediate" active={scheduleNow} onPress={() => setScheduleNow(true)} />
          <ScheduleBtn label="Scheduled" active={!scheduleNow} onPress={() => setScheduleNow(false)} />
        </View>

        <Button title="Confirm Booking" onPress={handleBook} loading={loading} style={styles.cta} />
      </Card>
    </ScreenScroll>
  );
}

function ScheduleBtn({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.scheduleBtn, active && styles.scheduleBtnActive]} onPress={onPress}>
      <Text style={[styles.scheduleBtnText, active && styles.scheduleBtnTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: fonts.sizeLg,
    fontWeight: fonts.weightSemiBold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  modeGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  modeCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.card,
  },
  modeCardActive: { borderColor: colors.primary },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconContainerActive: { backgroundColor: '#E6EFEE' },
  modeIcon: { fontSize: 26 },
  modeLabel: {
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightBold,
    color: colors.textMuted,
    textAlign: 'center',
  },
  modeLabelActive: { color: colors.primary },
  modeDesc: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
  bookingCard: { marginTop: spacing.sm },
  cardTitle: {
    fontSize: fonts.sizeXl,
    fontWeight: fonts.weightBold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fonts.sizeXs,
    fontWeight: fonts.weightSemiBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  textArea: {
    minHeight: 88,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: fonts.sizeMd,
    color: colors.text,
    textAlignVertical: 'top',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  scheduleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  scheduleBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  scheduleBtnText: {
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightMedium,
    color: colors.text,
  },
  scheduleBtnTextActive: { color: colors.white },
  cta: { marginTop: spacing.md },
});
