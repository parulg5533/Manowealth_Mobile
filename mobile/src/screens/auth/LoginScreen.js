import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

export default function LoginScreen({ navigation }) {
  const { loginUser } = useAuth();
  const { theme } = useTheme();
  const s = styles(theme);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post('/login', { email: email.toLowerCase(), password });
      if (res.data === 'admins and super admins cant login') {
        Toast.show({ type: 'error', text1: 'Admins cannot login here' });
        return;
      }
      await loginUser({
        username: res.data.user.username,
        userID: res.data.user._id,
        email: email.toLowerCase(),
        assigned_admin: res.data.user.assigned_admin,
      }, res.data.token);
      Toast.show({ type: 'success', text1: 'Login Successful' });
      // Navigator auto-switches to UserStack when user state is set
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Wrong email or password' });
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
        <View style={s.logoWrap}>
          <Image source={require('../../../assets/logo.png')} style={s.logo} resizeMode="contain" />
          <Text style={s.appName}>Manowealth</Text>
          <Text style={s.tagline}>Student Wellness Platform</Text>
        </View>

        <View style={s.card}>
          <Text style={s.title}>Student Login</Text>

          <View style={s.fieldWrap}>
            <Text style={s.label}>Email</Text>
            <TextInput
              style={[s.input, errors.email && s.inputError]}
              placeholder="your@iitp.ac.in"
              placeholderTextColor={theme.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? <Text style={s.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={s.fieldWrap}>
            <Text style={s.label}>Password</Text>
            <View style={s.pwWrap}>
              <TextInput
                style={[s.input, s.pwInput, errors.password && s.inputError]}
                placeholder="Password"
                placeholderTextColor={theme.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
              />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPw(!showPw)}>
                <Text style={s.eyeText}>{showPw ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={s.errorText}>{errors.password}</Text> : null}
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={s.forgotWrap}
          >
            <Text style={s.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Login</Text>}
          </TouchableOpacity>

          <View style={s.signupRow}>
            <Text style={s.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={s.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={s.divider} />

          <TouchableOpacity
            style={s.altBtn}
            onPress={() => navigation.navigate('AdminLogin')}
          >
            <Text style={s.altBtnText}>Admin Login →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: theme.bg, padding: 20, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  logo: { width: 72, height: 72, marginBottom: 10 },
  appName: { fontSize: 26, fontWeight: '800', color: theme.accent, letterSpacing: 1 },
  tagline: { fontSize: 13, color: theme.textMuted, marginTop: 4 },
  card: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  title: { fontSize: 22, fontWeight: '800', color: theme.textPrimary, textAlign: 'center', marginBottom: 20 },
  fieldWrap: { marginBottom: 16 },
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
  },
  inputError: { borderColor: theme.danger },
  pwWrap: { position: 'relative' },
  pwInput: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: 12, top: 10 },
  eyeText: { fontSize: 18 },
  errorText: { fontSize: 12, color: theme.danger, marginTop: 4 },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 16 },
  forgotText: { fontSize: 13, color: theme.accent },
  btn: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  signupText: { fontSize: 14, color: theme.textSecondary },
  signupLink: { fontSize: 14, color: theme.accent, fontWeight: '700' },
  divider: { height: 1, backgroundColor: theme.border, marginVertical: 12 },
  altBtn: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  altBtnText: { fontSize: 14, color: theme.textSecondary, fontWeight: '600' },
});
