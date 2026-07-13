import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { colors, spacing, fonts, borderRadius, shadows } from '../../src/constants/theme';
import { api } from '../../src/api/client';
import { Booking } from '../../src/types';
import { useAuth } from '../../src/context/AuthContext';
import { locationService } from '../../src/lib/location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, ScreenHeader, Card, Button, StatusBadge, LoadingView } from '../../src/components/ui';

type ActionType = 'start' | 'complete' | null;

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { worker, token } = useAuth();
  const [job, setJob] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<ActionType>(null);
  const [otpInput, setOtpInput] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchJob();
  }, [id]);

  useEffect(() => {
    if (worker && token && job?.status === 'in_progress') {
      locationService.init(worker.id, token);
      locationService.startTracking(job.id, worker.id);
    }
    return () => {
      locationService.stopTracking();
      locationService.disconnect();
    };
  }, [worker, token, job?.status]);

  async function fetchJob() {
    setLoading(true);
    try {
      const data = await api.getJob(id);
      setJob(data);
    } catch {
      Alert.alert('Error', 'Failed to load job details');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  function openActionModal(type: ActionType) {
    setActionModal(type);
    setOtpInput('');
    setRating(5);
  }

  async function handleAction() {
    if (!job || !actionModal) return;
    if (!otpInput.trim()) {
      Alert.alert('OTP Required', 'Please enter the OTP to proceed.');
      return;
    }
    setSubmitting(true);
    try {
      if (actionModal === 'start') {
        await api.startJob(job.id, otpInput);
        Alert.alert('Started', 'Job has been started!');
        if (worker && token) {
          await locationService.startTracking(job.id, worker.id);
        }
      } else {
        await api.completeJob(job.id, otpInput, rating);
        Alert.alert('Completed', 'Job has been marked complete!');
        locationService.stopTracking();
      }
      setActionModal(null);
      fetchJob();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Screen>
        <LoadingView message="Loading job details..." />
      </Screen>
    );
  }

  if (!job) return null;

  return (
    <Screen>
      <ScreenHeader title="Job Details" subtitle={job.serviceType} />

      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.cardTop}>
            <Text style={styles.serviceType}>{job.serviceType}</Text>
            <StatusBadge status={job.status} />
          </View>

          {job.user ? (
            <Text style={styles.customerName}>👤 {job.user.name || job.user.phoneNumber}</Text>
          ) : null}
          {job.customerAddress ? (
            <Text style={styles.address}>📍 {job.customerAddress}</Text>
          ) : null}

          <View style={styles.detailsSection}>
            <Text style={styles.detailLabel}>Booking ID</Text>
            <Text style={styles.detailValue}>{job.id.slice(0, 8)}</Text>
          </View>
          <View style={styles.detailsSection}>
            <Text style={styles.detailLabel}>Mode</Text>
            <Text style={styles.detailValue}>{job.mode === 'home_help' ? 'Home Help' : 'Driver'}</Text>
          </View>
          {job.durationHours ? (
            <View style={styles.detailsSection}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{job.durationHours}h</Text>
            </View>
          ) : null}
          {job.totalAmount ? (
            <View style={styles.detailsSection}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>₹{job.totalAmount}</Text>
            </View>
          ) : null}
        </Card>

        {(job.status === 'assigned' || job.status === 'in_progress') && (
          <View style={styles.actions}>
            {job.status === 'assigned' && (
              <Button title="Start Job" onPress={() => openActionModal('start')} />
            )}
            {job.status === 'in_progress' && (
              <Button title="Complete Job" onPress={() => openActionModal('complete')} />
            )}
          </View>
        )}

        <TouchableOpacity style={styles.emergencyBtn}>
          <Text style={styles.emergencyText}>🚨 Emergency Contact</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={actionModal !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {actionModal === 'start' ? 'Start Job' : 'Complete Job'}
            </Text>
            <Text style={styles.modalSub}>
              {actionModal === 'start'
                ? 'Enter the start OTP provided by the customer'
                : 'Enter the end OTP provided by the customer'}
            </Text>

            <TextInput
              style={styles.otpInput}
              placeholder="Enter OTP"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              value={otpInput}
              onChangeText={setOtpInput}
            />

            {actionModal === 'complete' && (
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Rating:</Text>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Text style={[styles.star, star <= rating && styles.starActive]}>★</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setActionModal(null)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, submitting && { opacity: 0.7 }]}
                onPress={handleAction}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.confirmText}>
                    {actionModal === 'start' ? 'Start' : 'Complete'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  serviceType: {
    fontSize: fonts.sizeLg,
    fontWeight: fonts.weightBold,
    color: colors.text,
    flex: 1,
  },
  customerName: {
    fontSize: fonts.sizeSm,
    color: colors.text,
    marginBottom: 2,
  },
  address: {
    fontSize: fonts.sizeSm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  detailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: fonts.sizeSm,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: fonts.sizeSm,
    fontWeight: fonts.weightSemiBold,
    color: colors.text,
  },
  actions: {
    marginBottom: spacing.md,
  },
  emergencyBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  emergencyText: {
    color: colors.error,
    fontSize: fonts.sizeSm,
    fontWeight: fonts.weightSemiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  modalTitle: {
    fontSize: fonts.sizeXl,
    fontWeight: fonts.weightBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  modalSub: {
    fontSize: fonts.sizeSm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  otpInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: fonts.sizeXxl,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: 4,
  },
  ratingLabel: {
    fontSize: fonts.sizeMd,
    color: colors.text,
    fontWeight: fonts.weightSemiBold,
    marginRight: spacing.sm,
  },
  star: {
    fontSize: 28,
    color: colors.border,
  },
  starActive: {
    color: colors.warning,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightSemiBold,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  confirmText: {
    color: colors.white,
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightBold,
  },
});
