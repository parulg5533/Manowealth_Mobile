import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

export default function HelpAFriendScreen({ navigation }) {
  const { theme } = useTheme();
  const s = styles(theme);

  const [form, setForm] = useState({
    reporterName: '',
    reporterEmail: '',
    friendName: '',
    friendContact: '',
    issue: '',
    reason: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key) => (val) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async () => {
    if (!agreed) {
      Toast.show({ type: 'error', text1: 'Please agree to the terms' });
      return;
    }
    if (!form.reporterName || !form.reporterEmail || !form.friendName || !form.issue) {
      Toast.show({ type: 'error', text1: 'Please fill all required fields' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/help-a-friend', form);
      setSubmitted(true);
      Toast.show({ type: 'success', text1: 'Report submitted. Thank you for helping!' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to submit report' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <Text style={{ fontSize: 60, marginBottom: 20 }}>💚</Text>
        <Text style={s.thankTitle}>Thank You!</Text>
        <Text style={s.thankText}>
          Your report has been submitted confidentially. Our counselors will reach out to your friend.
        </Text>
        <TouchableOpacity style={s.doneBtn} onPress={() => navigation.goBack()}>
          <Text style={s.doneBtnText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        {/* Hero */}
        <View style={s.heroBanner}>
          <Text style={s.heroIcon}>🤝</Text>
          <Text style={s.heroTitle}>Help a Friend</Text>
          <Text style={s.heroDesc}>
            If someone you care about might be struggling, you can confidentially report it here so we can help them.
          </Text>
          <View style={s.privacyNote}>
            <Text style={s.privacyText}>
              🔒 Your submission is completely confidential. Your name will{' '}
              <Text style={s.bold}>never be revealed</Text> to the person you are reporting about.
            </Text>
          </View>
        </View>

        {/* Your Information */}
        <View style={s.formCard}>
          <Text style={s.sectionTitle}>Your Information</Text>

          <View style={s.fieldWrap}>
            <Text style={s.label}>Your Name *</Text>
            <TextInput style={s.input} value={form.reporterName} onChangeText={set('reporterName')} placeholder="Your name" placeholderTextColor={theme.textMuted} />
          </View>

          <View style={s.fieldWrap}>
            <Text style={s.label}>Your Email *</Text>
            <TextInput style={s.input} value={form.reporterEmail} onChangeText={set('reporterEmail')} placeholder="your@iitp.ac.in" placeholderTextColor={theme.textMuted} keyboardType="email-address" autoCapitalize="none" />
          </View>
        </View>

        {/* Friend's Information */}
        <View style={s.formCard}>
          <Text style={s.sectionTitle}>Friend's Information</Text>

          <View style={s.fieldWrap}>
            <Text style={s.label}>Friend's Name *</Text>
            <TextInput style={s.input} value={form.friendName} onChangeText={set('friendName')} placeholder="Friend's name" placeholderTextColor={theme.textMuted} />
          </View>

          <View style={s.fieldWrap}>
            <Text style={s.label}>Friend's Contact (optional)</Text>
            <TextInput style={s.input} value={form.friendContact} onChangeText={set('friendContact')} placeholder="Phone or email" placeholderTextColor={theme.textMuted} />
          </View>
        </View>

        {/* Issue Details */}
        <View style={s.formCard}>
          <Text style={s.sectionTitle}>Issue Details</Text>

          <View style={s.fieldWrap}>
            <Text style={s.label}>What issue are they facing? *</Text>
            <TextInput
              style={[s.input, s.textarea]}
              value={form.issue}
              onChangeText={set('issue')}
              placeholder="Describe the concern (e.g., stress, depression, isolation...)"
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={s.fieldWrap}>
            <Text style={s.label}>Why are you reporting this?</Text>
            <TextInput
              style={[s.input, s.textarea]}
              value={form.reason}
              onChangeText={set('reason')}
              placeholder="What made you notice this issue..."
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={s.checkRow} onPress={() => setAgreed(!agreed)} activeOpacity={0.7}>
            <View style={[s.checkbox, agreed && s.checkboxOn]}>
              {agreed && <Text style={s.checkmark}>✓</Text>}
            </View>
            <Text style={s.checkLabel}>
              I understand this report is confidential and will only be used to provide support to my friend.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitBtnText}>Submit Report</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 16, paddingBottom: 40 },
  heroBanner: {
    backgroundColor: theme.card,
    borderRadius: 18, padding: 22, marginBottom: 14,
    borderWidth: 1, borderColor: theme.border,
  },
  heroIcon: { fontSize: 36, marginBottom: 10 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: theme.textPrimary, marginBottom: 8 },
  heroDesc: { fontSize: 14, color: theme.textSecondary, lineHeight: 22, marginBottom: 14 },
  privacyNote: {
    backgroundColor: 'rgba(52,211,153,0.06)',
    borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: 'rgba(52,211,153,0.2)',
  },
  privacyText: { fontSize: 13, color: theme.textSecondary, lineHeight: 20 },
  bold: { fontWeight: '700', color: theme.textPrimary },
  formCard: {
    backgroundColor: theme.card,
    borderRadius: 18, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: theme.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary, marginBottom: 14 },
  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: theme.elevated, borderWidth: 1, borderColor: theme.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 15, color: theme.textPrimary,
  },
  textarea: { minHeight: 90, paddingTop: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  checkbox: {
    width: 24, height: 24, borderWidth: 2, borderColor: theme.border,
    borderRadius: 6, marginTop: 2, alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: theme.sage, borderColor: theme.sage },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  checkLabel: { flex: 1, fontSize: 13, color: theme.textSecondary, lineHeight: 20 },
  submitBtn: {
    backgroundColor: theme.sage, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  thankTitle: { fontSize: 28, fontWeight: '900', color: theme.textPrimary, marginBottom: 12, textAlign: 'center' },
  thankText: { fontSize: 16, color: theme.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 28 },
  doneBtn: {
    backgroundColor: theme.elevated, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 32,
    borderWidth: 1, borderColor: theme.border,
  },
  doneBtnText: { color: theme.textPrimary, fontSize: 16, fontWeight: '700' },
});
