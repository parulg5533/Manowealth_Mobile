import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import api, { API_BASE_URL } from '../../api/api';
import Toast from 'react-native-toast-message';

export default function ForgotPasswordScreen({ navigation }) {
  const { theme } = useTheme();
  const s = styles(theme);

  const [step, setStep] = useState(1); // 1: email+otp, 2: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!email) { Toast.show({ type: 'error', text1: 'Enter your email' }); return; }
    setLoading(true);
    try {
      const checkRes = await api.post('/check-email', { email: email.toLowerCase() });
      if (checkRes.data === 'user doesnt exist') {
        Toast.show({ type: 'error', text1: 'Email not found' });
        return;
      }
      // Use raw axios to bypass auth interceptor (sendOtp doesn't use the token)
      await axios.post(`${API_BASE_URL}/sendOtp`, { email: email.toLowerCase() });
      Toast.show({ type: 'success', text1: 'OTP sent to your email' });
      setStep(2);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!otp) { Toast.show({ type: 'error', text1: 'Enter the OTP' }); return; }
    if (!newPassword || newPassword.length < 8) {
      Toast.show({ type: 'error', text1: 'Password must be at least 8 characters' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/reset-password', {
        otpBody: otp,
        email: email.toLowerCase(),
        password: newPassword,
      });
      Toast.show({ type: 'success', text1: 'Password reset successful!' });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Incorrect OTP or failed to reset' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.bg }}
    >
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <Text style={s.title}>Forgot Password</Text>
          <Text style={s.subtitle}>
            {step === 1 ? 'Enter your registered email to receive an OTP' : 'Enter the OTP sent to your email and your new password'}
          </Text>

          {step === 1 && (
            <>
              <Text style={s.label}>Email</Text>
              <TextInput
                style={s.input}
                placeholder="your@iitp.ac.in"
                placeholderTextColor={theme.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity style={s.btn} onPress={sendOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Send OTP</Text>}
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={s.label}>OTP</Text>
              <TextInput
                style={s.input}
                placeholder="Enter OTP from email"
                placeholderTextColor={theme.textMuted}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
              <Text style={s.label}>New Password</Text>
              <View style={s.pwWrap}>
                <TextInput
                  style={[s.input, s.pwInput]}
                  placeholder="New password (min 8 chars)"
                  placeholderTextColor={theme.textMuted}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPw}
                />
                <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPw(!showPw)}>
                  <Text style={s.eyeText}>{showPw ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={s.btn} onPress={resetPassword} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Reset Password</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={s.resendBtn} onPress={() => setStep(1)}>
                <Text style={s.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backText}>← Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: theme.bg, padding: 20, justifyContent: 'center' },
  card: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  title: { fontSize: 22, fontWeight: '800', color: theme.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: theme.textMuted, marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: theme.elevated,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: theme.textPrimary,
    marginBottom: 16,
  },
  pwWrap: { position: 'relative', marginBottom: 16 },
  pwInput: { paddingRight: 48, marginBottom: 0 },
  eyeBtn: { position: 'absolute', right: 12, top: 10 },
  eyeText: { fontSize: 18 },
  btn: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resendBtn: { alignItems: 'center', marginBottom: 12 },
  resendText: { fontSize: 14, color: theme.accent },
  backBtn: { alignItems: 'center', marginTop: 8 },
  backText: { fontSize: 14, color: theme.textMuted },
});
