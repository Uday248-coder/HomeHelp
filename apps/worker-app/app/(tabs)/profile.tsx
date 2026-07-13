import { View, Text, Alert, StyleSheet } from 'react-native';
import { colors, spacing, fonts, borderRadius, shadows } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { ScreenScroll, ScreenHeader, Card, Button } from '../../src/components/ui';

export default function ProfileScreen() {
  const { worker, logout } = useAuth();

  if (!worker) return null;

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  }

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

  const initial = (worker.name || 'W').charAt(0).toUpperCase();

  return (
    <ScreenScroll>
      <ScreenHeader title="Profile" subtitle="Your partner account" />

      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.userName}>{worker.name || 'Worker'}</Text>
        <Text style={styles.userSubtext}>{worker.phoneNumber || 'No phone linked'}</Text>
        <View style={styles.typeChip}>
          <Text style={styles.typeChipText}>{getWorkerTypeLabel(worker.workerType)}</Text>
        </View>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Rating</Text>
        {renderStars(worker.averageRating)}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Verification Status</Text>

        <View style={styles.verifRow}>
          <Text style={styles.verifLabel}>Aadhaar</Text>
          {worker.aadhaarVerified ? (
            <View style={[styles.verifBadge, { backgroundColor: colors.success + '1A', borderColor: colors.success + '40' }]}>
              <Text style={[styles.verifBadgeText, { color: colors.success }]}>Verified</Text>
            </View>
          ) : (
            <View style={[styles.verifBadge, { backgroundColor: colors.warning + '1A', borderColor: colors.warning + '40' }]}>
              <Text style={[styles.verifBadgeText, { color: colors.warning }]}>Pending</Text>
            </View>
          )}
        </View>

        <View style={[styles.verifRow, { marginTop: spacing.sm }]}>
          <Text style={styles.verifLabel}>License</Text>
          {worker.licenseVerified ? (
            <View style={[styles.verifBadge, { backgroundColor: colors.success + '1A', borderColor: colors.success + '40' }]}>
              <Text style={[styles.verifBadgeText, { color: colors.success }]}>Verified</Text>
            </View>
          ) : (
            <View style={[styles.verifBadge, { backgroundColor: colors.warning + '1A', borderColor: colors.warning + '40' }]}>
              <Text style={[styles.verifBadgeText, { color: colors.warning }]}>Pending</Text>
            </View>
          )}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Stats</Text>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{worker.totalJobs}</Text>
          <Text style={styles.statLabel}>Total Jobs Completed</Text>
        </View>
        <View style={[styles.statItem, { marginTop: spacing.md }]}>
          <Text style={[styles.statValue, { color: worker.isActive ? colors.success : colors.error }]}>
            {worker.isActive ? 'Active' : 'Inactive'}
          </Text>
          <Text style={styles.statLabel}>Account Status</Text>
        </View>
      </Card>

      <Button title="Sign Out" variant="secondary" onPress={handleLogout} style={styles.logout} />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.button,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: fonts.weightBold,
    color: colors.white,
  },
  userName: {
    fontSize: fonts.sizeXxl,
    fontWeight: fonts.weightBold,
    color: colors.text,
  },
  userSubtext: {
    fontSize: fonts.sizeMd,
    color: colors.textMuted,
    marginTop: 4,
  },
  typeChip: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  typeChipText: {
    fontSize: fonts.sizeSm,
    fontWeight: fonts.weightSemiBold,
    color: colors.primary,
  },
  card: { marginBottom: spacing.md },
  cardTitle: {
    fontSize: fonts.sizeLg,
    fontWeight: fonts.weightBold,
    color: colors.text,
    marginBottom: spacing.md,
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
    fontSize: fonts.sizeSm,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  verifRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verifLabel: {
    fontSize: fonts.sizeSm,
    color: colors.text,
  },
  verifBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  verifBadgeText: {
    fontSize: fonts.sizeXs,
    fontWeight: fonts.weightSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fonts.sizeXxl,
    fontWeight: fonts.weightBold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: fonts.sizeSm,
    color: colors.textMuted,
    marginTop: 2,
  },
  logout: { marginTop: spacing.md },
});
