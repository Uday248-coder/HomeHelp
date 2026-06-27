import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, spacing, fonts, borderRadius, shadows } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

const SERVICE_OPTIONS: Record<string, { label: string; options: string[] }> = {
  home_help: {
    label: 'Home Help',
    options: ['Full Home Cleaning', 'Kitchen Deep Clean', 'Bathroom Scrub', 'Living Room Tidy-up'],
  },
  driver: {
    label: 'Driver',
    options: ['Local Trip', 'Airport Transfer', 'Shopping Run', 'Outstation Trip'],
  },
};

const DURATION_OPTIONS = [1, 2, 3, 4, 6, 8];

export default function HomeScreen() {
  const { user } = useAuth();
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
      await api.createBooking({
        mode,
        serviceType,
        customerAddress: address,
        durationHours: duration,
        scheduledAt: scheduleNow ? undefined : new Date(Date.now() + 86400000).toISOString(),
      });
      Alert.alert('Success', 'Your booking has been created!');
      setAddress('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Hello{user?.name ? `, ${user.name}` : ''}
        </Text>
        <Text style={styles.welcomeSubtext}>What would you like help with today?</Text>
      </View>

      <View style={styles.modeSwitcher}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'home_help' && styles.modeButtonActive]}
          onPress={() => {
            setMode('home_help');
            setServiceType(SERVICE_OPTIONS.home_help.options[0]);
          }}
        >
          <Text style={[styles.modeIcon]}>🧹</Text>
          <Text style={[styles.modeLabel, mode === 'home_help' && styles.modeLabelActive]}>
            Home Help
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'driver' && styles.modeButtonActive]}
          onPress={() => {
            setMode('driver');
            setServiceType(SERVICE_OPTIONS.driver.options[0]);
          }}
        >
          <Text style={styles.modeIcon}>🚗</Text>
          <Text style={[styles.modeLabel, mode === 'driver' && styles.modeLabelActive]}>
            Driver
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Book {SERVICE_OPTIONS[mode].label}</Text>
        <Text style={styles.cardSubtitle}>Fill in the details below</Text>

        <Text style={styles.label}>Service Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsRow}>
          {SERVICE_OPTIONS[mode].options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, serviceType === opt && styles.chipActive]}
              onPress={() => setServiceType(opt)}
            >
              <Text style={[styles.chipText, serviceType === opt && styles.chipTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Service Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your address"
          placeholderTextColor={colors.textMuted}
          value={address}
          onChangeText={setAddress}
          multiline
        />

        <Text style={styles.label}>Duration (hours)</Text>
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

        <Text style={styles.label}>Schedule</Text>
        <View style={styles.scheduleRow}>
          <TouchableOpacity
            style={[styles.scheduleButton, scheduleNow && styles.scheduleButtonActive]}
            onPress={() => setScheduleNow(true)}
          >
            <Text style={[styles.scheduleText, scheduleNow && styles.scheduleTextActive]}>
              Now
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.scheduleButton, !scheduleNow && styles.scheduleButtonActive]}
            onPress={() => setScheduleNow(false)}
          >
            <Text style={[styles.scheduleText, !scheduleNow && styles.scheduleTextActive]}>
              Later
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.bookButton, loading && styles.buttonDisabled]}
          onPress={handleBook}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.bookButtonText}>Book Now</Text>
          )}
        </TouchableOpacity>
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
  welcomeSection: {
    marginBottom: spacing.lg,
  },
  welcomeText: {
    fontSize: fonts.sizeXxl,
    fontWeight: fonts.weightBold,
    color: colors.text,
  },
  welcomeSubtext: {
    fontSize: fonts.sizeMd,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  modeSwitcher: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.sm,
    ...shadows.card,
  },
  modeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: '#ecfdf5',
  },
  modeIcon: {
    fontSize: 20,
  },
  modeLabel: {
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightSemiBold,
    color: colors.textMuted,
  },
  modeLabelActive: {
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  cardTitle: {
    fontSize: fonts.sizeXl,
    fontWeight: fonts.weightBold,
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: fonts.sizeMd,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightMedium,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  optionsRow: {
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fonts.sizeSm,
    color: colors.text,
    fontWeight: fonts.weightMedium,
  },
  chipTextActive: {
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
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  durationChip: {
    width: 48,
    height: 40,
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
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightMedium,
    color: colors.text,
  },
  durationTextActive: {
    color: colors.white,
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scheduleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  scheduleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  scheduleText: {
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightMedium,
    color: colors.text,
  },
  scheduleTextActive: {
    color: colors.white,
  },
  bookButton: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    ...shadows.button,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  bookButtonText: {
    fontSize: fonts.sizeLg,
    fontWeight: fonts.weightBold,
    color: colors.white,
  },
});
