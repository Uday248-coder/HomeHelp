import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Alert, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { ScreenScroll, ScreenHeader, Card, Button, TextField, SegmentedControl } from 'homehelp-mobile-ui';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
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
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          Alert.alert('Name Required', 'Please enter your name.');
          setLoading(false);
          return;
        }
        await register({ email, password, name: name.trim(), phoneNumber: phone.trim() || undefined });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || 'Authentication failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenScroll keyboardAware contentContainerStyle={{ paddingBottom: 40 }}>
        <ScreenHeader title="HomeHelp" subtitle="Your home services, on demand" />

        <Card>
          <SegmentedControl
            options={[{ value: 'login', label: 'Login' }, { value: 'register', label: 'Sign Up' }]}
            value={mode}
            onChange={setMode}
            fullWidth
          />

          {mode === 'register' && (
            <>
              <TextField label="Full Name" placeholder="Your name" value={name} onChangeText={setName} autoCapitalize="words" />
              <TextField label="Phone (optional)" placeholder="+91 9876543210" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </>
          )}

          <TextField label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          <TextField label="Password" placeholder="At least 6 characters" value={password} onChangeText={setPassword} secureTextEntry />

          <Button title={mode === 'login' ? 'Login' : 'Create Account'} onPress={handleSubmit} loading={loading} fullWidth />
        </Card>

        <View style={{ alignItems: 'center', marginTop: 16 }}>
          <Button title={mode === 'login' ? 'New here? Create an account' : 'Already have an account? Login'} onPress={() => setMode(mode === 'login' ? 'register' : 'login')} variant="ghost" />
        </View>
      </ScreenScroll>
    </KeyboardAvoidingView>
  );
}