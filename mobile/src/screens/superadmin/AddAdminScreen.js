import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

export default function AddAdminScreen({ navigation }) {
  const { theme } = useTheme();
  const s = styles(theme);

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username required';
    if (!form.email.trim()) e.email = 'Email required';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 chars';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/create-admin', {
        username: form.username,
        email: form.email.toLowerCase(),
        password: form.password,
      });
      Toast.show({ type: 'success', text1: 'Admin created successfully!' });
      navigation.goBack();
    } catch (err) {
      const msg = err.response?.data || 'Failed to create admin';
      Toast.show({ type: 'error', text1: typeof msg === 'string' ? msg : 'Failed to create admin' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <Text style={s.title}>Create New Admin</Text>
          <Text style={s.subtitle}>The admin will be able to manage assigned students</Text>

          {[
            { key: 'username', label: 'Username', placeholder: 'Admin username' },
            { key: 'email', label: 'Email', placeholder: 'admin@iitp.ac.in', keyboardType: 'email-address', autoCapitalize: 'none' },
          ].map(f => (
            <View key={f.key} style={s.fieldWrap}>
              <Text style={s.label}>{f.label}</Text>
              <TextInput
                style={[s.input, errors[f.key] && s.inputError]}
                placeholder={f.placeholder}
                placeholderTextColor={theme.textMuted}
                value={form[f.key]}
                onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                keyboardType={f.keyboardType || 'default'}
                autoCapitalize={f.autoCapitalize || 'sentences'}
              />
              {errors[f.key] ? <Text style={s.errText}>{errors[f.key]}</Text> : null}
            </View>
          ))}

          <View style={s.fieldWrap}>
            <Text style={s.label}>Password</Text>
            <View style={s.pwWrap}>
              <TextInput
                style={[s.input, s.pwInput, errors.password && s.inputError]}
                placeholder="Min 8 characters"
                placeholderTextColor={theme.textMuted}
                value={form.password}
                onChangeText={v => setForm(p => ({ ...p, password: v }))}
                secureTextEntry={!showPw}
              />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPw(!showPw)}>
                <Text>{showPw ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={s.errText}>{errors.password}</Text> : null}
          </View>

          <TouchableOpacity style={s.btn} onPress={handleCreate} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Create Admin</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: theme.card, borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: theme.border,
  },
  title: { fontSize: 22, fontWeight: '800', color: theme.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: 14, color: theme.textMuted, marginBottom: 24, lineHeight: 20 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: theme.elevated, borderWidth: 1, borderColor: theme.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 15, color: theme.textPrimary,
  },
  inputError: { borderColor: theme.danger },
  pwWrap: { position: 'relative' },
  pwInput: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: 12, top: 11 },
  errText: { fontSize: 12, color: theme.danger, marginTop: 4 },
  btn: {
    backgroundColor: theme.success, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
