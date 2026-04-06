import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ImageBackground,
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
    emoji: '🧑‍🎓',
    tag: 'Academic',
    title: 'IITP Academic Affairs',
    desc: 'Manages and raises issues regarding academics for UG batches.',
    email: 'ugr@iitp.ac.in',
    phone: '+91 9464219896',
    color: '#f472b6',
  },
];

const QUOTES = [
  { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush", category: "Growth", color: "#7c83e0" },
  { text: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.", author: "Noam Shpancer", category: "Mindfulness", color: "#3ecfbe" },
  { text: "Self-care is not self-indulgence, it is self-preservation.", author: "Audre Lorde", category: "Wellness", color: "#6ecb8a" },
  { text: "Promise me you'll always remember — you're braver than you believe, stronger than you seem.", author: "A.A. Milne", category: "Strength", color: "#f472b6" },
  { text: "Healing takes time, and asking for help is a courageous step.", author: "Mariska Hargitay", category: "Courage", color: "#f0a96a" },
];

const FEATURES = [
  { icon: '📋', title: 'Wellness Survey', desc: '51-question psychosocial assessment', color: '#7c83e0' },
  { icon: '😊', title: 'Mood Tracking', desc: 'Daily mood & wellbeing logs', color: '#6ecb8a' },
  { icon: '🤖', title: 'AI Chatbot', desc: '24/7 wellness companion', color: '#3ecfbe' },
  { icon: '👨‍⚕️', title: 'Counselors', desc: 'Connect with professionals', color: '#f0a96a' },
  { icon: '🤝', title: 'Peer Support', desc: 'Help a friend in need', color: '#fb7185' },
  { icon: '📅', title: 'Appointments', desc: 'Book sessions easily', color: '#a78bfa' },
];

export default function MainScreen({ navigation }) {
  const { theme } = useTheme();
  const s = styles(theme);
  const [quoteIdx, setQuoteIdx] = useState(0);

  const quote = QUOTES[quoteIdx];
  const nextQuote = () => setQuoteIdx(i => (i + 1) % QUOTES.length);
  const prevQuote = () => setQuoteIdx(i => (i - 1 + QUOTES.length) % QUOTES.length);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* Hero — IIT Patna campus photo background */}
      <ImageBackground
        source={require('../../../assets/StudentLoginBackground.jpg')}
        style={s.hero}
        imageStyle={s.heroBgImage}
        resizeMode="cover"
      >
        <View style={s.heroOverlay} />
        <Image source={require('../../../assets/logo.png')} style={s.heroLogo} resizeMode="contain" />
        <Text style={s.heroTitle}>
          Mano<Text style={{ color: theme.accent }}>wealth</Text>
        </Text>
        <Text style={s.heroInstitute}>IIT Patna  ·  Student Wellness Platform</Text>
        <Text style={s.heroDesc}>
          Your trusted companion for mental health and wellness support. Take assessments, track your mood, and connect with counselors.
        </Text>
        <TouchableOpacity style={s.ctaBtn} onPress={() => navigation.navigate('Login')} activeOpacity={0.85}>
          <Text style={s.ctaBtnText}>Get Started  →</Text>
        </TouchableOpacity>
      </ImageBackground>

      {/* Inspirational Quote Card — bg1 illustration on right */}
      <View style={[s.quoteCard, { borderTopColor: quote.color }]}>
        {/* Left: text */}
        <View style={s.quoteContent}>
          <View style={s.quoteTopRow}>
            <View style={[s.categoryPill, { backgroundColor: quote.color + '22', borderColor: quote.color + '55' }]}>
              <Text style={[s.categoryText, { color: quote.color }]}>✦  {quote.category}</Text>
            </View>
            <Text style={s.quoteCounter}>{quoteIdx + 1}/{QUOTES.length}</Text>
          </View>

          <Text style={[s.quoteBgMark, { color: quote.color }]}>"</Text>
          <Text style={s.quoteBody}>{quote.text}</Text>

          <View style={s.quoteAttributionRow}>
            <View style={[s.quoteAccentBar, { backgroundColor: quote.color }]} />
            <Text style={[s.quoteAuthor, { color: quote.color }]}>{quote.author}</Text>
          </View>

          <View style={s.quoteNavRow}>
            <TouchableOpacity style={[s.quoteNavBtn, { borderColor: quote.color + '55' }]} onPress={prevQuote}>
              <Text style={[s.quoteNavText, { color: quote.color }]}>‹</Text>
            </TouchableOpacity>
            <View style={s.quoteDotRow}>
              {QUOTES.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setQuoteIdx(i)}>
                  <View style={[s.quoteDot, { backgroundColor: i === quoteIdx ? quote.color : theme.border, width: i === quoteIdx ? 16 : 6 }]} />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[s.quoteNavBtn, { borderColor: quote.color + '55' }]} onPress={nextQuote}>
              <Text style={[s.quoteNavText, { color: quote.color }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right: wellness illustration */}
        <Image
          source={require('../../../assets/bg1.png')}
          style={s.quoteIllustration}
          resizeMode="cover"
        />
      </View>

      {/* What We Offer */}
      <Text style={s.sectionTitle}>What We Offer</Text>
      <View style={s.featuresGrid}>
        {FEATURES.map(f => (
          <View key={f.title} style={[s.featureCard, { borderTopColor: f.color }]}>
            <View style={[s.featureIconWrap, { backgroundColor: f.color + '20' }]}>
              <Text style={s.featureIcon}>{f.icon}</Text>
            </View>
            <Text style={s.featureTitle}>{f.title}</Text>
            <Text style={s.featureDesc}>{f.desc}</Text>
          </View>
        ))}
      </View>

      {/* Support Resources */}
      <Text style={s.sectionTitle}>Support Resources</Text>
      {RESOURCES.map(r => (
        <View key={r.title} style={[s.resourceCard, { borderLeftColor: r.color }]}>
          <View style={[s.resourceIconWrap, { backgroundColor: r.color + '20' }]}>
            <Text style={s.resourceEmoji}>{r.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={s.resourceTagRow}>
              <View style={[s.resourceTag, { backgroundColor: r.color + '20', borderColor: r.color + '60' }]}>
                <Text style={[s.resourceTagText, { color: r.color }]}>{r.tag}</Text>
              </View>
            </View>
            <Text style={s.resourceTitle}>{r.title}</Text>
            <Text style={s.resourceDesc}>{r.desc}</Text>
            <View style={s.contactRow}>
              <Text style={s.contactIcon}>✉</Text>
              <Text style={[s.contactText, { color: r.color }]}>{r.email}</Text>
            </View>
            <View style={s.contactRow}>
              <Text style={s.contactIcon}>☎</Text>
              <Text style={[s.contactText, { color: r.color }]}>{r.phone}</Text>
            </View>
          </View>
        </View>
      ))}

      {/* Help a Friend — accessible without login */}
      <TouchableOpacity
        style={s.helpCard}
        onPress={() => navigation.navigate('HelpAFriend')}
        activeOpacity={0.85}
      >
        <Image
          source={require('../../../assets/bg4.png')}
          style={s.helpCardIllustration}
          resizeMode="cover"
        />
        <View style={s.helpCardContent}>
          <View style={[s.helpBadge, { backgroundColor: '#fb718522', borderColor: '#fb718555' }]}>
            <Text style={[s.helpBadgeText, { color: '#fb7185' }]}>No login needed</Text>
          </View>
          <Text style={s.helpCardTitle}>Help a Friend</Text>
          <Text style={s.helpCardDesc}>
            Know someone who is struggling? Report it anonymously and our counselors will reach out.
          </Text>
          <View style={s.helpCardBtn}>
            <Text style={s.helpCardBtnText}>Submit a Report  →</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* CTA Card */}
      <View style={s.ctaCard}>
        <Text style={s.ctaEmoji}>🌱</Text>
        <Text style={s.ctaCardTitle}>Ready to begin your{'\n'}wellness journey?</Text>
        <TouchableOpacity style={s.ctaCardBtn} onPress={() => navigation.navigate('Signup')} activeOpacity={0.85}>
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
  content: { padding: 16, paddingBottom: 44 },

  // Hero
  hero: {
    borderRadius: 24, overflow: 'hidden',
    padding: 28, marginBottom: 16, alignItems: 'center',
    minHeight: 300,
  },
  heroBgImage: { borderRadius: 24 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,12,20,0.68)',
    borderRadius: 24,
  },
  heroLogo: { width: 80, height: 80, marginBottom: 14 },
  heroTitle: { fontSize: 40, fontWeight: '900', color: '#fff', marginBottom: 6 },
  heroInstitute: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '600', letterSpacing: 0.6, marginBottom: 14 },
  heroDesc: { fontSize: 14, color: 'rgba(255,255,255,0.80)', textAlign: 'center', lineHeight: 22, marginBottom: 26 },
  ctaBtn: {
    backgroundColor: theme.accent, borderRadius: 14,
    paddingHorizontal: 32, paddingVertical: 14,
  },
  ctaBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  // Quote card — split layout
  quoteCard: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 20, borderWidth: 1, borderColor: theme.border,
    borderTopWidth: 3, overflow: 'hidden', marginBottom: 24,
    minHeight: 220,
  },
  quoteContent: { flex: 1, padding: 18 },
  quoteTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  categoryPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  categoryText: { fontSize: 11, fontWeight: '700' },
  quoteCounter: { fontSize: 11, color: theme.textMuted, fontWeight: '600' },
  quoteBgMark: { fontSize: 52, fontWeight: '900', lineHeight: 50, marginBottom: 2, opacity: 0.25 },
  quoteBody: { fontSize: 14, color: theme.textPrimary, fontStyle: 'italic', lineHeight: 22, marginBottom: 14 },
  quoteAttributionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  quoteAccentBar: { width: 18, height: 2.5, borderRadius: 1 },
  quoteAuthor: { fontSize: 12, fontWeight: '700' },
  quoteNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quoteNavBtn: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  quoteNavText: { fontSize: 20, fontWeight: '700', lineHeight: 22 },
  quoteDotRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  quoteDot: { height: 6, borderRadius: 3 },
  quoteIllustration: { width: 115, alignSelf: 'stretch' },

  // Features
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.textPrimary, marginBottom: 14 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  featureCard: {
    width: '47%', backgroundColor: theme.card, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: theme.border, borderTopWidth: 2,
  },
  featureIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  featureIcon: { fontSize: 22 },
  featureTitle: { fontSize: 14, fontWeight: '700', color: theme.textPrimary, marginBottom: 4 },
  featureDesc: { fontSize: 12, color: theme.textMuted, lineHeight: 17 },

  // Resources
  resourceCard: {
    flexDirection: 'row', gap: 14,
    backgroundColor: theme.card, borderRadius: 18, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: theme.border, borderLeftWidth: 4,
  },
  resourceIconWrap: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  resourceEmoji: { fontSize: 22 },
  resourceTagRow: { flexDirection: 'row', marginBottom: 6 },
  resourceTag: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1 },
  resourceTagText: { fontSize: 10, fontWeight: '700' },
  resourceTitle: { fontSize: 15, fontWeight: '700', color: theme.textPrimary, marginBottom: 4 },
  resourceDesc: { fontSize: 13, color: theme.textSecondary, lineHeight: 18, marginBottom: 6 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  contactIcon: { fontSize: 11, color: theme.textMuted },
  contactText: { fontSize: 12, fontWeight: '600' },

  // Help a Friend card
  helpCard: {
    flexDirection: 'row',
    backgroundColor: theme.card, borderRadius: 20,
    borderWidth: 1, borderColor: '#fb718540',
    borderLeftWidth: 4, borderLeftColor: '#fb7185',
    overflow: 'hidden', marginBottom: 16, minHeight: 170,
  },
  helpCardIllustration: { width: 110, alignSelf: 'stretch' },
  helpCardContent: { flex: 1, padding: 16, justifyContent: 'center' },
  helpBadge: {
    alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 9, paddingVertical: 3, marginBottom: 8,
  },
  helpBadgeText: { fontSize: 10, fontWeight: '700' },
  helpCardTitle: { fontSize: 18, fontWeight: '900', color: theme.textPrimary, marginBottom: 6 },
  helpCardDesc: { fontSize: 12, color: theme.textSecondary, lineHeight: 18, marginBottom: 12 },
  helpCardBtn: {
    backgroundColor: '#fb7185', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start',
  },
  helpCardBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // CTA
  ctaCard: {
    backgroundColor: theme.card, borderRadius: 22, padding: 28,
    borderWidth: 1, borderColor: theme.border, alignItems: 'center', marginTop: 8,
  },
  ctaEmoji: { fontSize: 40, marginBottom: 12 },
  ctaCardTitle: { fontSize: 20, fontWeight: '800', color: theme.textPrimary, textAlign: 'center', marginBottom: 22, lineHeight: 28 },
  ctaCardBtn: {
    backgroundColor: theme.accent, borderRadius: 14,
    paddingHorizontal: 32, paddingVertical: 14, marginBottom: 14, width: '100%', alignItems: 'center',
  },
  ctaCardBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  ctaCardLink: { fontSize: 14, color: theme.accent, fontWeight: '600' },
});
