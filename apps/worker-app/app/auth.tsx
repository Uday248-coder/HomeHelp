import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Alert, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { ScreenScroll, ScreenHeader, Card, Button, TextField, SegmentedControl } from 'homehelp-mobile-ui';

export default function AuthScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function handleSubmit() {
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
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || 'Authentication failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenScroll keyboardAware contentContainerStyle={{ paddingBottom: 40 }}>
        <ScreenHeader title="HomeHelp" subtitle="Worker Portal — Sign in" />
        <Card>
          <TextField label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextField label="Password" placeholder="At least 6 characters" value={password} onChangeText={setPassword} secureTextEntry />
          <Button title="Sign In" onPress={handleSubmit} loading={loading} fullWidth />
        </Card>
      </ScreenScroll>
    </KeyboardAvoidingView>
  );
}