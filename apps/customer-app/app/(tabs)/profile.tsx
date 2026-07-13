import { View, Text, Alert, StyleSheet } from 'react-native';
import { colors, spacing, fonts, shadows } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { ScreenScroll, ScreenHeader, Card, Button } from '../../src/components/ui';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  }

  const initial = (user?.name || user?.phoneNumber || '?').charAt(0).toUpperCase();

  return (
    <ScreenScroll>
      <ScreenHeader title="Profile" subtitle="Your account at a glance" />

      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userSubtext}>
          {user?.phoneNumber ? `+91 ${user.phoneNumber}` : 'No phone linked'}
        </Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Account Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>+91 {user?.phoneNumber || 'N/A'}</Text>
        </View>
        {user?.email ? (
          <View style={[styles.infoRow, styles.lastRow]}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        ) : null}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>App Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0 (MVP)</Text>
        </View>
        <View style={[styles.infoRow, styles.lastRow]}>
          <Text style={styles.infoLabel}>Operating City</Text>
          <Text style={styles.infoValue}>Kolkata</Text>
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
  card: { marginBottom: spacing.md },
  cardTitle: {
    fontSize: fonts.sizeLg,
    fontWeight: fonts.weightBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  infoLabel: {
    fontSize: fonts.sizeSm,
    color: colors.textMuted,
    fontWeight: fonts.weightMedium,
  },
  infoValue: {
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightSemiBold,
    color: colors.text,
  },
  logout: { marginTop: spacing.md },
});
