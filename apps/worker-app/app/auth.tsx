import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, fonts, borderRadius, shadows } from '../src/constants/theme';
import { useAuth } from '../src/context/AuthContext';
import { Screen, Card, Button, Chip, TextField } from '../src/components/ui';

type Mode = 'login' | 'register' | 'profile';

const WORKER_TYPES: { value: 'home_help' | 'driver' | 'both'; label: string }[] = [
  { value: 'home_help', label: 'Home Help' },
  { value: 'driver', label: 'Driver' },
  { value: 'both', label: 'Both' },
];

export default function AuthScreen() {
  const { login, register, completeProfile, needsWorkerProfile } = useAuth();
  const [mode, setMode] = useState<Mode>(needsWorkerProfile ? 'profile' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [workerType, setWorkerType] = useState<'home_help' | 'driver' | 'both'>('home_help');
  const [loading, setLoading] = useState(false);

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function handleLogin() {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      if (needsWorkerProfile) setMode('profile');
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || 'Login failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register({
        email,
        password,
        name: name.trim(),
        workerType,
        phoneNumber: phone.trim() || undefined,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || 'Registration failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteProfile() {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }
    setLoading(true);
    try {
      await completeProfile({
        name: name.trim(),
        workerType,
        phoneNumber: phone.trim() || undefined,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || 'Failed to create profile';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>HomeHelp</Text>
            <Text style={styles.subtitle}>
              {mode === 'profile' ? 'Complete your worker profile' : 'Worker Partner App'}
            </Text>
          </View>

          {mode !== 'profile' && (
            <View style={styles.segment}>
              <TouchableOpacity
                style={[styles.segmentBtn, mode === 'login' && styles.segmentBtnActive]}
                onPress={() => setMode('login')}
              >
                <Text style={[styles.segmentText, mode === 'login' && styles.segmentTextActive]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentBtn, mode === 'register' && styles.segmentBtnActive]}
                onPress={() => setMode('register')}
              >
                <Text style={[styles.segmentText, mode === 'register' && styles.segmentTextActive]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}

          <Card>
            <TextField
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
            />

            <Text style={styles.label}>Worker Type</Text>
            <View style={styles.typeRow}>
              {WORKER_TYPES.map((t) => (
                <Chip
                  key={t.value}
                  label={t.label}
                  active={workerType === t.value}
                  onPress={() => setWorkerType(t.value)}
                />
              ))}
            </View>

            {mode !== 'profile' && (
              <>
                <TextField
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                />
                <TextField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 6 characters"
                  secureTextEntry
                />
              </>
            )}

            <TextField
              label="Phone (optional)"
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 9876543210"
            />

            <Button
              title={
                loading
                  ? 'Please wait...'
                  : mode === 'login'
                  ? 'Login'
                  : mode === 'register'
                  ? 'Create Account'
                  : 'Save Profile'
              }
              onPress={
                mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleCompleteProfile
              }
              loading={loading}
              disabled={loading}
            />

            {mode !== 'profile' && (
              <TouchableOpacity
                style={styles.backLink}
                onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
              >
                <Text style={styles.backLinkText}>
                  {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Login'}
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: fonts.sizeXxl,
    fontWeight: fonts.weightBold,
    fontFamily: fonts.display,
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fonts.sizeMd,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.md,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  segmentBtnActive: {
    backgroundColor: colors.card,
    ...shadows.card,
  },
  segmentText: {
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightSemiBold,
    color: colors.textMuted,
  },
  segmentTextActive: {
    color: colors.primary,
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
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  backLink: {
    marginTop: spacing.md,
  },
  backLinkText: {
    color: colors.primary,
    textAlign: 'center',
    fontSize: fonts.sizeSm,
    fontWeight: fonts.weightMedium,
  },
});
