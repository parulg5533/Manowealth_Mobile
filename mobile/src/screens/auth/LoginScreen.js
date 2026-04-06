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

        {/* Top banner — IIT Patna campus photo */}
        <View style={s.banner}>
          <Image
            source={require('../../../assets/StudentLoginBackground.jpg')}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View style={s.bannerOverlay} />
          <Image source={require('../../../assets/logo.png')} style={s.logo} resizeMode="contain" />
          <Text style={s.appName}>Manowealth</Text>
          <Text style={s.tagline}>Student Wellness Platform · IIT Patna</Text>
        </View>

        {/* Login form card */}
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

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={s.forgotWrap}>
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

          <TouchableOpacity style={s.altBtn} onPress={() => navigation.navigate('AdminLogin')}>
            <Text style={s.altBtnText}>Admin Login →</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: theme.bg },

  // Campus photo banner
  banner: {
    height: 220, alignItems: 'center', justifyContent: 'flex-end',
    paddingBottom: 24, overflow: 'hidden',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,12,22,0.62)',
  },
  logo: { width: 60, height: 60, marginBottom: 10 },
  appName: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  tagline: { fontSize: 12, color: 'rgba(255,255,255,0.70)', marginTop: 4, fontWeight: '500' },

  // Form card
  card: {
    backgroundColor: theme.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingTop: 30, flex: 1,
    borderTopWidth: 1, borderColor: theme.border,
    marginTop: -16,
  },
  title: { fontSize: 22, fontWeight: '800', color: theme.textPrimary, textAlign: 'center', marginBottom: 24 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: theme.elevated, borderWidth: 1, borderColor: theme.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: theme.textPrimary,
  },
  inputError: { borderColor: theme.danger },
  pwWrap: { position: 'relative' },
  pwInput: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: 12, top: 11 },
  eyeText: { fontSize: 18 },
  errorText: { fontSize: 12, color: theme.danger, marginTop: 4 },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 18 },
  forgotText: { fontSize: 13, color: theme.accent, fontWeight: '600' },
  btn: {
    backgroundColor: theme.accent, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', marginBottom: 16,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  signupText: { fontSize: 14, color: theme.textSecondary },
  signupLink: { fontSize: 14, color: theme.accent, fontWeight: '700' },
  divider: { height: 1, backgroundColor: theme.border, marginVertical: 12 },
  altBtn: {
    borderWidth: 1, borderColor: theme.border, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  altBtnText: { fontSize: 14, color: theme.textSecondary, fontWeight: '600' },
});
