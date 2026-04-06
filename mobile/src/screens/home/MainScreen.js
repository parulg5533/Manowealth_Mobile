import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const RESOURCES = [
  {
    emoji: '💙',
    tag: 'Wellness',
    title: 'IITP Counselor Unit',
    desc: 'Our counselors assist students in managing academic, personal, and emotional challenges.',
    email: 'counselor2@iitp.ac.in',
    phone: '+91 9721322486',
    color: '#7c83e0',
  },
  {
    emoji: '🏃',
    tag: 'Student Life',
    title: 'IITP Gymkhana',
    desc: 'Promotes leadership, talent, and co-curricular engagement through sports and cultural events.',
    email: 'vpgymkhana@iitp.ac.in',
    phone: '+91 9302886207',
    color: '#34d399',
  },
  {
    emoji: '🎭',
    tag: 'Culture',
    title: 'IITP HoSCA',
    desc: 'Manages cultural activities including Nebula, Reverberance, and fest Anwesha.',
    email: 'gensec_cult@iitp.ac.in',
    phone: '+91 8427632279',
    color: '#f472b6',
  },
];

export default function MainScreen({ navigation }) {
  const { theme } = useTheme();
  const s = styles(theme);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Hero */}
      <View style={s.hero}>
        <Image source={require('../../../assets/logo.png')} style={s.heroLogo} resizeMode="contain" />
        <Text style={s.heroTitle}>
          Mano<Text style={s.heroAccent}>wealth</Text>
        </Text>
        <Text style={s.heroSub}>
          Student Wellness Platform{'\n'}IIT Patna
        </Text>
        <Text style={s.heroDesc}>
          Your trusted companion for mental health and wellness support. Take assessments, track your mood, and connect with counselors.
        </Text>
        <TouchableOpacity style={s.ctaBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={s.ctaBtnText}>Get Started →</Text>
        </TouchableOpacity>
      </View>

      {/* Features */}
      <Text style={s.sectionTitle}>What We Offer</Text>
      <View style={s.featuresGrid}>
        {[
          { icon: '📋', title: 'Wellness Survey', desc: '51-question psychosocial assessment' },
          { icon: '😊', title: 'Mood Tracking', desc: 'Daily mood & wellbeing logs' },
          { icon: '🤖', title: 'AI Chatbot', desc: '24/7 wellness companion' },
          { icon: '👨‍⚕️', title: 'Counselors', desc: 'Connect with professionals' },
          { icon: '🤝', title: 'Peer Support', desc: 'Help a friend in need' },
          { icon: '📅', title: 'Appointments', desc: 'Book sessions easily' },
        ].map(f => (
          <View key={f.title} style={s.featureCard}>
            <Text style={s.featureIcon}>{f.icon}</Text>
            <Text style={s.featureTitle}>{f.title}</Text>
            <Text style={s.featureDesc}>{f.desc}</Text>
          </View>
        ))}
      </View>

      {/* Support Resources */}
      <Text style={s.sectionTitle}>Support Resources</Text>
      {RESOURCES.map(r => (
        <View key={r.title} style={[s.resourceCard, { borderLeftColor: r.color }]}>
          <Text style={s.resourceEmoji}>{r.emoji}</Text>
          <View style={{ flex: 1 }}>
            <View style={s.resourceTagRow}>
              <View style={[s.resourceTag, { backgroundColor: r.color + '20', borderColor: r.color + '60' }]}>
                <Text style={[s.resourceTagText, { color: r.color }]}>{r.tag}</Text>
              </View>
            </View>
            <Text style={s.resourceTitle}>{r.title}</Text>
            <Text style={s.resourceDesc}>{r.desc}</Text>
            <Text style={s.resourceContact}>{r.email}</Text>
            <Text style={s.resourceContact}>{r.phone}</Text>
          </View>
        </View>
      ))}

      {/* CTA */}
      <View style={s.ctaCard}>
        <Text style={s.ctaCardTitle}>Ready to begin your wellness journey?</Text>
        <TouchableOpacity style={s.ctaCardBtn} onPress={() => navigation.navigate('Signup')}>
          <Text style={s.ctaCardBtnText}>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={s.ctaCardLink}>Already have an account? Login →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 16, paddingBottom: 40 },
  hero: {
    backgroundColor: theme.card, borderRadius: 22, padding: 28, marginBottom: 24,
    borderWidth: 1, borderColor: theme.border, alignItems: 'center',
  },
  heroLogo: { width: 80, height: 80, marginBottom: 16 },
  heroTitle: { fontSize: 36, fontWeight: '900', color: theme.textPrimary, marginBottom: 4 },
  heroAccent: { color: theme.accent },
  heroSub: { fontSize: 15, color: theme.textMuted, textAlign: 'center', marginBottom: 12, lineHeight: 22 },
  heroDesc: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  ctaBtn: {
    backgroundColor: theme.accent, borderRadius: 14,
    paddingHorizontal: 28, paddingVertical: 13,
  },
  ctaBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.textPrimary, marginBottom: 14 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  featureCard: {
    width: '47%', backgroundColor: theme.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: theme.border,
  },
  featureIcon: { fontSize: 28, marginBottom: 8 },
  featureTitle: { fontSize: 14, fontWeight: '700', color: theme.textPrimary, marginBottom: 4 },
  featureDesc: { fontSize: 12, color: theme.textMuted, lineHeight: 17 },
  resourceCard: {
    flexDirection: 'row', gap: 14,
    backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: theme.border, borderLeftWidth: 4,
  },
  resourceEmoji: { fontSize: 28, marginTop: 2 },
  resourceTagRow: { flexDirection: 'row', marginBottom: 6 },
  resourceTag: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1 },
  resourceTagText: { fontSize: 10, fontWeight: '700' },
  resourceTitle: { fontSize: 15, fontWeight: '700', color: theme.textPrimary, marginBottom: 4 },
  resourceDesc: { fontSize: 13, color: theme.textSecondary, lineHeight: 18, marginBottom: 6 },
  resourceContact: { fontSize: 12, color: theme.accent },
  ctaCard: {
    backgroundColor: theme.card, borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: theme.border, alignItems: 'center', marginTop: 8,
  },
  ctaCardTitle: {
    fontSize: 18, fontWeight: '800', color: theme.textPrimary,
    textAlign: 'center', marginBottom: 20, lineHeight: 26,
  },
  ctaCardBtn: {
    backgroundColor: theme.accent, borderRadius: 14,
    paddingHorizontal: 32, paddingVertical: 14, marginBottom: 14, width: '100%', alignItems: 'center',
  },
  ctaCardBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  ctaCardLink: { fontSize: 14, color: theme.accent },
});
