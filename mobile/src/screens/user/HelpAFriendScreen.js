import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Image,
  TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

const ISSUES = [
  'Academic Stress', 'Anxiety', 'Depression', 'Isolation / Loneliness',
  'Relationship Issues', 'Family Problems', 'Substance Use', 'Self-Harm Concern', 'Other',
];

export default function HelpAFriendScreen({ navigation }) {
  const { theme } = useTheme();
  const s = styles(theme);

  const [form, setForm] = useState({
    reporterName: '',
    reporterEmail: '',
    reporterRollNo: '',
    friendName: '',
    friendRollNo: '',
    friendContact: '',
    issue: '',
    reason: '',
  });
  const [selectedIssue, setSelectedIssue] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key) => (val) => setForm(p => ({ ...p, [key]: val }));

  const handleIssueSelect = (issue) => {
    setSelectedIssue(issue);
    set('issue')(issue === 'Other' ? '' : issue);
  };

  const validate = () => {
    if (!form.reporterName.trim()) {
      Toast.show({ type: 'error', text1: 'Your name is required' }); return false;
    }
    if (!form.reporterEmail.trim()) {
      Toast.show({ type: 'error', text1: 'Your email is required' }); return false;
    }
    if (!form.friendName.trim()) {
      Toast.show({ type: 'error', text1: "Friend's name is required" }); return false;
    }
    if (!form.friendContact.trim()) {
      Toast.show({ type: 'error', text1: "Friend's contact is required" }); return false;
    }
    if (!form.issue.trim()) {
      Toast.show({ type: 'error', text1: 'Please describe the issue' }); return false;
    }
    if (!form.reason.trim()) {
      Toast.show({ type: 'error', text1: 'Please explain why you are reporting' }); return false;
    }
    if (!agreed) {
      Toast.show({ type: 'error', text1: 'Please agree to the confidentiality terms' }); return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/help-a-friend', form);
      setSubmitted(true);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to submit report';
      Toast.show({ type: 'error', text1: msg });
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (submitted) {
    return (
      <View style={[s.container, s.successWrap]}>
        <View style={s.successCard}>
          <Text style={s.successEmoji}>💚</Text>
          <Text style={s.successTitle}>Thank You!</Text>
          <Text style={s.successText}>
            Your report has been submitted confidentially. Our counselors will reach out to your friend discreetly.
          </Text>
          <View style={s.successNote}>
            <Text style={s.successNoteText}>🔒 Your identity will never be revealed</Text>
          </View>
          <TouchableOpacity style={s.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={s.doneBtnText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        {/* Hero banner with wellness illustration */}
        <View style={s.heroBanner}>
          <Image
            source={require('../../../assets/bg1.png')}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View style={s.heroOverlay} />
          <View style={s.heroContent}>
            <Text style={s.heroIcon}>🤝</Text>
            <Text style={s.heroTitle}>Help a Friend</Text>
            <Text style={s.heroDesc}>
              If someone you care about is struggling, report it here so our counselors can help — anonymously.
            </Text>
            <View style={s.heroBadgeRow}>
              <View style={s.heroBadge}>
                <Text style={s.heroBadgeText}>🔒 Fully Confidential</Text>
              </View>
              <View style={s.heroBadge}>
                <Text style={s.heroBadgeText}>✓ No Login Required</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Your Information */}
        <View style={s.formCard}>
          <View style={s.cardTitleRow}>
            <View style={[s.cardTitleDot, { backgroundColor: theme.accent }]} />
            <Text style={s.sectionTitle}>Your Information</Text>
          </View>

          <Field label="Your Name *" theme={theme}>
            <TextInput style={s.input} value={form.reporterName} onChangeText={set('reporterName')} placeholder="Your full name" placeholderTextColor={theme.textMuted} />
          </Field>

          <Field label="Your Email *" theme={theme}>
            <TextInput style={s.input} value={form.reporterEmail} onChangeText={set('reporterEmail')} placeholder="your@iitp.ac.in" placeholderTextColor={theme.textMuted} keyboardType="email-address" autoCapitalize="none" />
          </Field>

          <Field label="Your Roll No. (optional)" theme={theme}>
            <TextInput style={s.input} value={form.reporterRollNo} onChangeText={set('reporterRollNo')} placeholder="e.g. 2201CS01" placeholderTextColor={theme.textMuted} autoCapitalize="none" />
          </Field>
        </View>

        {/* Friend's Information */}
        <View style={s.formCard}>
          <View style={s.cardTitleRow}>
            <View style={[s.cardTitleDot, { backgroundColor: '#fb7185' }]} />
            <Text style={s.sectionTitle}>Friend's Information</Text>
          </View>

          <Field label="Friend's Name *" theme={theme}>
            <TextInput style={s.input} value={form.friendName} onChangeText={set('friendName')} placeholder="Friend's name" placeholderTextColor={theme.textMuted} />
          </Field>

          <Field label="Friend's Contact *" theme={theme} hint="Phone number or email — so we can reach them">
            <TextInput style={s.input} value={form.friendContact} onChangeText={set('friendContact')} placeholder="Phone or email" placeholderTextColor={theme.textMuted} />
          </Field>

          <Field label="Friend's Roll No. (optional)" theme={theme}>
            <TextInput style={s.input} value={form.friendRollNo} onChangeText={set('friendRollNo')} placeholder="e.g. 2201CS02" placeholderTextColor={theme.textMuted} autoCapitalize="none" />
          </Field>
        </View>

        {/* Issue Details */}
        <View style={s.formCard}>
          <View style={s.cardTitleRow}>
            <View style={[s.cardTitleDot, { backgroundColor: theme.amber }]} />
            <Text style={s.sectionTitle}>Issue Details</Text>
          </View>

          {/* Issue type chips */}
          <Text style={s.label}>Type of Concern *</Text>
          <View style={s.chipsWrap}>
            {ISSUES.map(issue => (
              <TouchableOpacity
                key={issue}
                style={[s.chip, selectedIssue === issue && s.chipSelected]}
                onPress={() => handleIssueSelect(issue)}
                activeOpacity={0.75}
              >
                <Text style={[s.chipText, selectedIssue === issue && s.chipTextSelected]}>
                  {issue}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Free-text issue field — always shown, pre-filled by chip unless "Other" */}
          <Field label={selectedIssue === 'Other' ? 'Describe the issue *' : 'Additional details'} theme={theme}>
            <TextInput
              style={[s.input, s.textarea]}
              value={form.issue}
              onChangeText={set('issue')}
              placeholder="Describe what you've observed (e.g. withdrawal, mood changes, statements...)"
              placeholderTextColor={theme.textMuted}
              multiline numberOfLines={4} textAlignVertical="top"
            />
          </Field>

          <Field label="Why are you reporting this? *" theme={theme} hint="What made you notice something was wrong?">
            <TextInput
              style={[s.input, s.textarea]}
              value={form.reason}
              onChangeText={set('reason')}
              placeholder="e.g. They told me they feel hopeless, or I noticed they stopped attending classes..."
              placeholderTextColor={theme.textMuted}
              multiline numberOfLines={4} textAlignVertical="top"
            />
          </Field>

          {/* Confidentiality agreement */}
          <TouchableOpacity style={s.checkRow} onPress={() => setAgreed(!agreed)} activeOpacity={0.7}>
            <View style={[s.checkbox, agreed && { backgroundColor: theme.sage, borderColor: theme.sage }]}>
              {agreed && <Text style={s.checkmark}>✓</Text>}
            </View>
            <Text style={s.checkLabel}>
              I understand this report is <Text style={{ fontWeight: '700', color: theme.textPrimary }}>completely confidential</Text> and my identity will never be revealed to my friend.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[s.submitBtn, !agreed && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.submitBtnText}>Submit Confidential Report</Text>}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Small helper component for form fields
function Field({ label, hint, theme, children }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 6 }}>{label}</Text>
      {children}
      {hint ? <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>{hint}</Text> : null}
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { paddingBottom: 44 },

  // Hero banner
  heroBanner: { height: 240, justifyContent: 'flex-end', overflow: 'hidden', marginBottom: 16 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,12,22,0.60)',
  },
  heroContent: { padding: 20, paddingBottom: 22 },
  heroIcon: { fontSize: 34, marginBottom: 8 },
  heroTitle: { fontSize: 26, fontWeight: '900', color: '#fff', marginBottom: 8 },
  heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.82)', lineHeight: 20, marginBottom: 12 },
  heroBadgeRow: { flexDirection: 'row', gap: 8 },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  heroBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  // Form cards
  formCard: {
    backgroundColor: theme.card, borderRadius: 18, padding: 18,
    marginHorizontal: 16, marginBottom: 14,
    borderWidth: 1, borderColor: theme.border,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  cardTitleDot: { width: 4, height: 18, borderRadius: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary },
  label: { fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: theme.elevated, borderWidth: 1, borderColor: theme.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 15, color: theme.textPrimary,
  },
  textarea: { minHeight: 96, paddingTop: 12 },

  // Issue chips
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
    backgroundColor: theme.elevated, borderWidth: 1, borderColor: theme.border,
  },
  chipSelected: { backgroundColor: theme.amber + '25', borderColor: theme.amber },
  chipText: { fontSize: 12, color: theme.textSecondary, fontWeight: '600' },
  chipTextSelected: { color: theme.amber, fontWeight: '700' },

  // Consent checkbox
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 18 },
  checkbox: {
    width: 24, height: 24, borderWidth: 2, borderColor: theme.border,
    borderRadius: 6, marginTop: 1, alignItems: 'center', justifyContent: 'center',
  },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  checkLabel: { flex: 1, fontSize: 13, color: theme.textSecondary, lineHeight: 20 },

  // Submit
  submitBtn: {
    backgroundColor: '#fb7185', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Success screen
  successWrap: { justifyContent: 'center', alignItems: 'center', padding: 28 },
  successCard: {
    backgroundColor: theme.card, borderRadius: 24, padding: 32,
    borderWidth: 1, borderColor: theme.border, alignItems: 'center', width: '100%',
  },
  successEmoji: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 28, fontWeight: '900', color: theme.textPrimary, marginBottom: 12 },
  successText: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 16 },
  successNote: {
    backgroundColor: theme.sage + '18', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: theme.sage + '40', marginBottom: 24,
  },
  successNoteText: { fontSize: 13, color: theme.sage, fontWeight: '700' },
  doneBtn: {
    backgroundColor: theme.elevated, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 32,
    borderWidth: 1, borderColor: theme.border,
  },
  doneBtnText: { color: theme.textPrimary, fontSize: 15, fontWeight: '700' },
});
