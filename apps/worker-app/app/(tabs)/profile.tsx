import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, fontSize, shadow } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';

export default function ProfileScreen() {
  const { worker, logout } = useAuth();

  if (!worker) return null;

  function renderStars(rating: number) {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} style={[styles.star, star <= Math.round(rating) && styles.starActive]}>
            ★
          </Text>
        ))}
        <Text style={styles.ratingText}>({rating.toFixed(1)})</Text>
      </View>
    );
  }

  function getWorkerTypeLabel(type: string) {
    switch (type) {
      case 'home_help':
        return 'Home Help';
      case 'driver':
        return 'Driver';
      case 'both':
        return 'Home Help & Driver';
      default:
        return type;
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>
          {(worker.name || 'W').charAt(0).toUpperCase()}
        </Text>
      </View>

      <Text style={styles.name}>{worker.name || 'Worker'}</Text>
      <Text style={styles.phone}>{worker.phoneNumber}</Text>
      <Text style={styles.type}>{getWorkerTypeLabel(worker.workerType)}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rating</Text>
        {renderStars(worker.averageRating)}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Verification Status</Text>

        <View style={styles.verifRow}>
          <Text style={styles.verifLabel}>Aadhaar</Text>
          {worker.aadhaarVerified ? (
            <View style={[styles.verifBadge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.verifBadgeText, { color: colors.success }]}>Verified ✅</Text>
            </View>
          ) : (
            <View style={[styles.verifBadge, { backgroundColor: colors.warning + '20' }]}>
              <Text style={[styles.verifBadgeText, { color: colors.warning }]}>Pending</Text>
            </View>
          )}
        </View>

        <View style={[styles.verifRow, { marginTop: spacing.sm }]}>
          <Text style={styles.verifLabel}>License</Text>
          {worker.licenseVerified ? (
            <View style={[styles.verifBadge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.verifBadgeText, { color: colors.success }]}>Verified ✅</Text>
            </View>
          ) : (
            <View style={[styles.verifBadge, { backgroundColor: colors.warning + '20' }]}>
              <Text style={[styles.verifBadgeText, { color: colors.warning }]}>Pending</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Stats</Text>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{worker.totalJobs}</Text>
          <Text style={styles.statLabel}>Total Jobs Completed</Text>
        </View>
        <View style={[styles.statItem, { marginTop: spacing.md }]}>
          <Text style={styles.statValue}>
            {worker.isActive ? 'Active' : 'Inactive'}
          </Text>
          <Text style={styles.statLabel}>Account Status</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.white,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  phone: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  type: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 24,
    color: colors.border,
    marginRight: 2,
  },
  starActive: {
    color: colors.warning,
  },
  ratingText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  verifRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verifLabel: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  verifBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  verifBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    width: '100%',
    marginTop: spacing.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
