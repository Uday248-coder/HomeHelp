import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, fonts, borderRadius, shadows } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/api/client';

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
        { text: 'View Details', onPress: () => router.push(`/booking/${booking.booking.id}`) }
      ]);
      setAddress('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day,</Text>
            <Text style={styles.userName}>{user?.name || 'Valued Guest'}</Text>
          </View>
          <View style={styles.profilePlaceholder} />
        </View>

        <Text style={styles.sectionTitle}>Choose a Service</Text>
        <View style={styles.modeGrid}>
          <TouchableOpacity
            style={[styles.modeCard, mode === 'home_help' && styles.modeCardActive]}
            onPress={() => {
              setMode('home_help');
              setServiceType(SERVICE_OPTIONS.home_help.options[0]);
            }}
          >
            <View style={[styles.iconContainer, mode === 'home_help' && styles.iconContainerActive]}>
              <Text style={styles.modeIcon}>🏠</Text>
            </View>
            <Text style={[styles.modeLabel, mode === 'home_help' && styles.modeLabelActive]}>
              Home Help
            </Text>
            <Text style={styles.modeDesc}>{SERVICE_OPTIONS.home_help.description}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeCard, mode === 'driver' && styles.modeCardActive]}
            onPress={() => {
              setMode('driver');
              setServiceType(SERVICE_OPTIONS.driver.options[0]);
            }}
          >
            <View style={[styles.iconContainer, mode === 'driver' && styles.iconContainerActive]}>
              <Text style={styles.modeIcon}>🚗</Text>
            </View>
            <Text style={[styles.modeLabel, mode === 'driver' && styles.modeLabelActive]}>
              Driver
            </Text>
            <Text style={styles.modeDesc}>{SERVICE_OPTIONS.driver.description}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bookingCard}>
          <Text style={styles.cardTitle}>Booking Details</Text>
          
          <Text style={styles.label}>Service Type</Text>
          <View style={styles.optionsGrid}>
            {SERVICE_OPTIONS[mode].options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.optionChip, serviceType === opt && styles.optionChipActive]}
                onPress={() => setServiceType(opt)}
              >
                <Text style={[styles.optionChipText, serviceType === opt && styles.optionChipTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Service Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter full address, including landmark"
            placeholderTextColor={colors.textMuted}
            value={address}
            onChangeText={setAddress}
            multiline
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Duration</Text>
              <View style={styles.durationRow}>
                {DURATION_OPTIONS.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.durationChip, duration === h && styles.durationChipActive]}
                    onPress={() => setDuration(h)}
                  >
                    <Text style={[styles.durationText, duration === h && styles.durationTextActive]}>
                      {h}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.label}>Schedule</Text>
          <View style={styles.scheduleRow}>
            <TouchableOpacity
              style={[styles.scheduleBtn, scheduleNow && styles.scheduleBtnActive]}
              onPress={() => setScheduleNow(true)}
            >
              <Text style={[styles.scheduleBtnText, scheduleNow && styles.scheduleBtnTextActive]}>Immediate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.scheduleBtn, !scheduleNow && styles.scheduleBtnActive]}
              onPress={() => setScheduleNow(false)}
            >
              <Text style={[styles.scheduleBtnText, !scheduleNow && styles.scheduleBtnTextActive]}>Scheduled</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleBook}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Confirm Booking</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  greeting: {
    fontSize: fonts.sizeMd,
    color: colors.textMuted,
    fontWeight: fonts.weightRegular,
  },
  userName: {
    fontSize: fonts.sizeXxl,
    fontWeight: fonts.weightBold,
    color: colors.text,
  },
  profilePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    opacity: 0.2,
  },
  sectionTitle: {
    fontSize: fonts.sizeLg,
    fontWeight: fonts.weightSemiBold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.md,
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
  modeCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconContainerActive: {
    backgroundColor: '#E6EFEE',
  },
  modeIcon: {
    fontSize: 24,
  },
  modeLabel: {
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightBold,
    color: colors.textMuted,
    textAlign: 'center',
  },
  modeLabelActive: {
    color: colors.primary,
  },
  modeDesc: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
  bookingCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardTitle: {
    fontSize: fonts.sizeXl,
    fontWeight: fonts.weightBold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fonts.sizeSm,
    fontWeight: fonts.weightSemiBold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionChipText: {
    fontSize: fonts.sizeSm,
    color: colors.text,
    fontWeight: fonts.weightMedium,
  },
  optionChipTextActive: {
    color: colors.white,
  },
  input: {
    minHeight: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: fonts.sizeMd,
    color: colors.text,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  durationChip: {
    width: 44,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationText: {
    fontSize: fonts.sizeSm,
    fontWeight: fonts.weightMedium,
    color: colors.text,
  },
  durationTextActive: {
    color: colors.white,
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
    backgroundColor: colors.background,
    borderWidth: 1,
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
  scheduleBtnTextActive: {
    color: colors.white,
  },
  primaryButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: fonts.sizeLg,
    fontWeight: fonts.weightBold,
    color: colors.white,
  },
});
