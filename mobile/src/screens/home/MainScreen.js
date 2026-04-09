import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ImageBackground, Linking, ActivityIndicator, Animated,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import API_BASE_URL from '../../config';

const TEAM = [
  {
    name: 'Prof.Jimson Mathew',
    role: 'Dean, Student Affairs',
    email: 'dean_sa@iitp.ac.in',
    initials: 'JM',
    color: '#7c83e0',
    emoji: '🎓',
  },
  {
    name: 'Aditya',
    role: 'Counselor',
    email: 'counselor2@iitp.ac.in',
    initials: 'AD',
    color: '#3ecfbe',
    emoji: '💙',
  },
  {
    name: 'Dr.Mahendar Ram',
    role: 'PIC Wellness',
    email: 'pic_wellness@iitp.ac.in',
    initials: 'MR',
    color: '#f0a96a',
    emoji: '🌿',
  },
];

const DEVELOPERS = [
  {
    name: 'Parul Garg',
    role: 'Developer',
    branch: 'IIT Patna',
    initials: 'PG',
    color: '#7c83e0',
    linkedin: 'https://www.linkedin.com/in/parul-garg-iitp',
  },
  {
    name: 'Mihika Saxena',
    role: 'Developer',
    branch: 'IIT Patna',
    initials: 'MS',
    color: '#f472b6',
    linkedin: 'https://www.linkedin.com/in/mihika-saxena-b5bb8a28b/',
  },
];

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

const GYMKHANA = [
  { role: "Vice President, Students' Gymkhana", name: 'Vanapalli Yuvan', rollNo: '2301EE43', color: '#7c83e0', initials: 'VY' },
  { role: 'Under Graduate Representative', name: 'Parul Garg', rollNo: '2301CS35', color: '#3ecfbe', initials: 'PG' },
  { role: 'Post Graduate Representative', name: 'Biplab Dawn', rollNo: '2321MA10', color: '#f0a96a', initials: 'BD' },
  { role: 'General Secretary, Cultural', name: 'Viraj Gururaj Kulkarni', rollNo: '2301MM25', color: '#f472b6', initials: 'VK' },
  { role: 'General Secretary, Sports', name: 'Rishabh Singraur', rollNo: '2302ST04', color: '#6ecb8a', initials: 'RS' },
  { role: 'General Secretary, Technical', name: 'Abhitesh Shukla', rollNo: '2301EE52', color: '#a78bfa', initials: 'AS' },
  { role: 'General Secretary, Welfare', name: 'Dhivyesh R', rollNo: '', color: '#38bdf8', initials: 'DR' },
  { role: 'General Secretary, Alumni Relations', name: 'Chirag Garg', rollNo: '2301CS13', color: '#fbbf24', initials: 'CG' },
];

const EVENT_COLORS = ['#7c83e0', '#3ecfbe', '#f0a96a', '#f472b6', '#6ecb8a', '#a78bfa'];

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
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventIdx, setEventIdx] = useState(0);
  const [gymkhanaOpen, setGymkhanaOpen] = useState(false);

  const quote = QUOTES[quoteIdx];
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const quoteIdxRef = useRef(0);

  const animateTo = useRef((newIdx) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -24, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      setQuoteIdx(newIdx);
      quoteIdxRef.current = newIdx;
      slideAnim.setValue(24);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  }).current;

  const nextQuote = () => animateTo((quoteIdxRef.current + 1) % QUOTES.length);
  const prevQuote = () => animateTo((quoteIdxRef.current - 1 + QUOTES.length) % QUOTES.length);

  useEffect(() => {
    const timer = setInterval(() => {
      animateTo((quoteIdxRef.current + 1) % QUOTES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Event carousel animation
  const evFadeAnim = useRef(new Animated.Value(1)).current;
  const evSlideAnim = useRef(new Animated.Value(0)).current;
  const evIdxRef = useRef(0);

  const animateEventTo = useRef((newIdx) => {
    Animated.parallel([
      Animated.timing(evFadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(evSlideAnim, { toValue: -20, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setEventIdx(newIdx);
      evIdxRef.current = newIdx;
      evSlideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(evFadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(evSlideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  }).current;

  const nextEvent = (len) => animateEventTo((evIdxRef.current + 1) % len);
  const prevEvent = (len) => animateEventTo((evIdxRef.current - 1 + len) % len);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/events`)
      .then(res => {
        const sorted = (res.data?.data || []).sort(
          (a, b) => new Date(a.eventDate) - new Date(b.eventDate)
        );
        setEvents(sorted);
        setEventIdx(0);
        evIdxRef.current = 0;
      })
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  }, []);

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

      {/* Upcoming Events */}
      <View style={s.eventsSectionHeader}>
        <Text style={s.sectionTitle}>Upcoming Events</Text>
        {events.some(e => {
          const age = (Date.now() - new Date(e.createdAt)) / 3600000;
          return age < 48;
        }) && (
          <View style={s.newBadge}><Text style={s.newBadgeText}>NEW</Text></View>
        )}
      </View>
      {eventsLoading ? (
        <ActivityIndicator size="small" color={theme.accent} style={{ marginBottom: 24 }} />
      ) : events.length === 0 ? (
        <View style={s.noEventsCard}>
          <Text style={s.noEventsEmoji}>📭</Text>
          <Text style={s.noEventsText}>No upcoming events</Text>
        </View>
      ) : (() => {
        const ev = events[eventIdx];
        const color = EVENT_COLORS[eventIdx % EVENT_COLORS.length];
        const isNew = (Date.now() - new Date(ev.createdAt)) / 3600000 < 48;
        return (
          <View style={[s.eventCarousel, { borderTopColor: color }]}>
            <Animated.View style={{ opacity: evFadeAnim, transform: [{ translateX: evSlideAnim }] }}>
              <View style={s.eventCarouselTop}>
                <View style={[s.eventIconWrap, { backgroundColor: color + '20' }]}>
                  <Text style={s.eventIcon}>📅</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.eventTitleRow}>
                    <Text style={s.eventTitle} numberOfLines={2}>{ev.title}</Text>
                    {isNew && <View style={[s.eventNewPill, { backgroundColor: color + '22', borderColor: color }]}><Text style={[s.eventNewText, { color }]}>NEW</Text></View>}
                  </View>
                  <Text style={s.eventDesc} numberOfLines={3}>{ev.description}</Text>
                </View>
              </View>
              <View style={[s.eventMetaDivider, { backgroundColor: color + '30' }]} />
              <View style={s.eventMeta}>
                <View style={s.eventMetaItem}>
                  <Text style={s.eventMetaIcon}>🗓</Text>
                  <Text style={[s.eventMetaText, { color }]}>
                    {new Date(ev.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <View style={s.eventMetaItem}>
                  <Text style={s.eventMetaIcon}>⏰</Text>
                  <Text style={[s.eventMetaText, { color }]}>
                    {new Date(ev.eventDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={s.eventMetaItem}>
                  <Text style={s.eventMetaIcon}>📍</Text>
                  <Text style={[s.eventMetaText, { color }]} numberOfLines={1}>
                    {(ev.venue && ev.venue !== 'TBD') ? ev.venue : (ev.location && ev.location !== 'TBD') ? ev.location : 'TBD'}
                  </Text>
                </View>
              </View>
            </Animated.View>
            {events.length > 1 && (
              <View style={s.eventNavRow}>
                <TouchableOpacity style={[s.eventNavBtn, { borderColor: color + '55' }]} onPress={() => prevEvent(events.length)}>
                  <Text style={[s.eventNavText, { color }]}>‹</Text>
                </TouchableOpacity>
                <View style={s.eventDotRow}>
                  {events.map((_, i) => (
                    <TouchableOpacity key={i} onPress={() => animateEventTo(i)}>
                      <View style={[s.eventDot, { backgroundColor: i === eventIdx ? color : theme.border, width: i === eventIdx ? 14 : 5 }]} />
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={[s.eventNavBtn, { borderColor: color + '55' }]} onPress={() => nextEvent(events.length)}>
                  <Text style={[s.eventNavText, { color }]}>›</Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={[s.eventCounter, { color: color + '99' }]}>{eventIdx + 1} / {events.length}</Text>
          </View>
        );
      })()}

      {/* Inspirational Quote Card */}
      <View style={[s.quoteCard, { borderTopColor: quote.color }]}>
        <View style={s.quoteContent}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
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
          </Animated.View>
          <View style={s.quoteNavRow}>
            <TouchableOpacity style={[s.quoteNavBtn, { borderColor: quote.color + '55' }]} onPress={prevQuote}>
              <Text style={[s.quoteNavText, { color: quote.color }]}>‹</Text>
            </TouchableOpacity>
            <View style={s.quoteDotRow}>
              {QUOTES.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => animateTo(i)}>
                  <View style={[s.quoteDot, { backgroundColor: i === quoteIdx ? quote.color : theme.border, width: i === quoteIdx ? 16 : 6 }]} />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[s.quoteNavBtn, { borderColor: quote.color + '55' }]} onPress={nextQuote}>
              <Text style={[s.quoteNavText, { color: quote.color }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Resized illustration */}
        <Image
          source={require('../../../assets/bg1.png')}
          style={s.quoteIllustration}
          resizeMode="contain"
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
        {/* Resized illustration */}
        <Image
          source={require('../../../assets/bg4.png')}
          style={s.helpCardIllustration}
          resizeMode="contain"
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

      {/* Meet the Team */}
      <Text style={s.sectionTitle}>Meet the Team</Text>
      <View style={s.teamCard}>
        {TEAM.map((member, idx) => (
          <View key={member.name}>
            <TouchableOpacity
              style={s.teamRow}
              onPress={() => Linking.openURL(`mailto:${member.email}`)}
              activeOpacity={0.78}
            >
              <View style={[s.teamAvatar, { backgroundColor: member.color + '20', borderColor: member.color + '50' }]}>
                <Text style={s.teamEmoji}>{member.emoji}</Text>
              </View>
              <View style={s.teamInfo}>
                <Text style={s.teamName}>{member.name}</Text>
                <View style={[s.teamRolePill, { backgroundColor: member.color + '18', borderColor: member.color + '40' }]}>
                  <Text style={[s.teamRoleText, { color: member.color }]}>{member.role}</Text>
                </View>
                <View style={s.teamEmailRow}>
                  <Text style={s.teamEmailIcon}>✉</Text>
                  <Text style={[s.teamEmail, { color: member.color }]}>{member.email}</Text>
                </View>
              </View>
              <Text style={[s.teamArrow, { color: member.color }]}>›</Text>
            </TouchableOpacity>
            {idx < TEAM.length - 1 && <View style={s.teamDivider} />}
          </View>
        ))}
      </View>

      {/* Student Gymkhana Core Team */}
      <TouchableOpacity
        style={s.gymkhanaBtn}
        onPress={() => setGymkhanaOpen(o => !o)}
        activeOpacity={0.82}
      >
        <View style={s.gymkhanaBtnLeft}>
          <View style={s.gymkhanaBtnIcon}>
            <Text style={{ fontSize: 20 }}>🏛️</Text>
          </View>
          <View>
            <Text style={s.gymkhanaBtnTitle}>Student Gymkhana</Text>
            <Text style={s.gymkhanaBtnSub}>Core Team — IIT Patna</Text>
          </View>
        </View>
        <View style={[s.gymkhanaBtnBadge, gymkhanaOpen && { backgroundColor: '#f472b6' }]}>
          <Text style={[s.gymkhanaBtnBadgeText, gymkhanaOpen && { color: '#fff' }]}>
            {gymkhanaOpen ? '▲' : '▼'}
          </Text>
        </View>
      </TouchableOpacity>

      {gymkhanaOpen && (
        <View style={[s.teamCard, { marginBottom: 28 }]}>
          {GYMKHANA.map((member, idx) => (
            <View key={member.name + idx}>
              <View style={[s.teamRow, { paddingHorizontal: 16 }]}>
                <View style={[s.teamAvatar, { backgroundColor: member.color + '20', borderColor: member.color + '50' }]}>
                  <Text style={[s.devInitials, { color: member.color, fontSize: 14 }]}>{member.initials}</Text>
                </View>
                <View style={s.teamInfo}>
                  <Text style={s.teamName}>{member.name}</Text>
                  <View style={[s.teamRolePill, { backgroundColor: member.color + '18', borderColor: member.color + '40' }]}>
                    <Text style={[s.teamRoleText, { color: member.color }]}>{member.role}</Text>
                  </View>
                  {member.rollNo ? <Text style={[s.teamEmailIcon, { marginTop: 2, fontSize: 10 }]}>{member.rollNo}</Text> : null}
                </View>
              </View>
              {idx < GYMKHANA.length - 1 && <View style={s.teamDivider} />}
            </View>
          ))}
        </View>
      )}

      {/* Meet the Developers */}
      <Text style={s.sectionTitle}>Meet the Developers</Text>
      <View style={s.devsGrid}>
        {DEVELOPERS.map(dev => (
          <TouchableOpacity
            key={dev.name}
            style={[s.devCard, { borderTopColor: dev.color }]}
            onPress={() => Linking.openURL(dev.linkedin)}
            activeOpacity={0.82}
          >
            <View style={[s.devAvatar, { backgroundColor: dev.color + '22', borderColor: dev.color + '55' }]}>
              <Text style={[s.devInitials, { color: dev.color }]}>{dev.initials}</Text>
            </View>
            <Text style={s.devName}>{dev.name}</Text>
            <Text style={[s.devRole, { color: dev.color }]}>{dev.role}</Text>
            <Text style={s.devBranch}>{dev.branch}</Text>
            <View style={[s.devLinkedInBtn, { backgroundColor: dev.color + '18', borderColor: dev.color + '44' }]}>
              <Text style={[s.devLinkedInText, { color: dev.color }]}>in  LinkedIn →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

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

  // Quote card — split layout (illustration resized)
  quoteCard: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 20, borderWidth: 1, borderColor: theme.border,
    borderTopWidth: 3, overflow: 'hidden', marginBottom: 24,
    minHeight: 200,
  },
  quoteContent: { flex: 1, padding: 16 },
  quoteTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  categoryPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  categoryText: { fontSize: 11, fontWeight: '700' },
  quoteCounter: { fontSize: 11, color: theme.textMuted, fontWeight: '600' },
  quoteBgMark: { fontSize: 44, fontWeight: '900', lineHeight: 44, marginBottom: 2, opacity: 0.25 },
  quoteBody: { fontSize: 13, color: theme.textPrimary, fontStyle: 'italic', lineHeight: 20, marginBottom: 12 },
  quoteAttributionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  quoteAccentBar: { width: 18, height: 2.5, borderRadius: 1 },
  quoteAuthor: { fontSize: 12, fontWeight: '700' },
  quoteNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quoteNavBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  quoteNavText: { fontSize: 20, fontWeight: '700', lineHeight: 22 },
  quoteDotRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  quoteDot: { height: 6, borderRadius: 3 },
  quoteIllustration: { width: 82, height: 130, alignSelf: 'center' },

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

  // Help a Friend card (illustration resized)
  helpCard: {
    flexDirection: 'row',
    backgroundColor: theme.card, borderRadius: 20,
    borderWidth: 1, borderColor: '#fb718540',
    borderLeftWidth: 4, borderLeftColor: '#fb7185',
    overflow: 'hidden', marginBottom: 24, minHeight: 140,
  },
  helpCardIllustration: { width: 82, height: 120, alignSelf: 'center' },
  helpCardContent: { flex: 1, padding: 14, justifyContent: 'center' },
  helpBadge: {
    alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 9, paddingVertical: 3, marginBottom: 7,
  },
  helpBadgeText: { fontSize: 10, fontWeight: '700' },
  helpCardTitle: { fontSize: 17, fontWeight: '900', color: theme.textPrimary, marginBottom: 5 },
  helpCardDesc: { fontSize: 12, color: theme.textSecondary, lineHeight: 17, marginBottom: 10 },
  helpCardBtn: {
    backgroundColor: '#fb7185', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 7, alignSelf: 'flex-start',
  },
  helpCardBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Events carousel
  eventsSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  newBadge: { backgroundColor: '#fb7185', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  newBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  noEventsCard: {
    backgroundColor: theme.card, borderRadius: 16, padding: 24,
    alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: theme.border,
  },
  noEventsEmoji: { fontSize: 32, marginBottom: 8 },
  noEventsText: { fontSize: 14, color: theme.textMuted, fontWeight: '600' },
  eventCarousel: {
    backgroundColor: theme.card, borderRadius: 20, padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: theme.border, borderTopWidth: 3,
  },
  eventCarouselTop: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  eventIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  eventIcon: { fontSize: 20 },
  eventTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  eventTitle: { fontSize: 14, fontWeight: '800', color: theme.textPrimary, flex: 1 },
  eventNewPill: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
  eventNewText: { fontSize: 9, fontWeight: '800' },
  eventDesc: { fontSize: 12, color: theme.textSecondary, lineHeight: 17 },
  eventMetaDivider: { height: 1, marginBottom: 10 },
  eventMeta: { flexDirection: 'row', gap: 14, flexWrap: 'wrap', marginBottom: 12 },
  eventMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  eventMetaIcon: { fontSize: 11 },
  eventMetaText: { fontSize: 12, fontWeight: '700' },
  eventNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  eventNavBtn: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  eventNavText: { fontSize: 20, fontWeight: '700', lineHeight: 22 },
  eventDotRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  eventDot: { height: 6, borderRadius: 3 },
  eventCounter: { fontSize: 10, fontWeight: '600', textAlign: 'right' },

  // Meet the Team
  teamCard: {
    backgroundColor: theme.card, borderRadius: 20,
    borderWidth: 1, borderColor: theme.border,
    overflow: 'hidden', marginBottom: 28,
  },
  teamRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16,
  },
  teamAvatar: {
    width: 50, height: 50, borderRadius: 25, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  teamEmoji: { fontSize: 22 },
  teamInfo: { flex: 1, gap: 4 },
  teamName: { fontSize: 14, fontWeight: '800', color: theme.textPrimary },
  teamRolePill: {
    alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 9, paddingVertical: 3,
  },
  teamRoleText: { fontSize: 10, fontWeight: '700' },
  teamEmailRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  teamEmailIcon: { fontSize: 10, color: theme.textMuted },
  teamEmail: { fontSize: 11, fontWeight: '600' },
  teamArrow: { fontSize: 22, fontWeight: '700' },
  teamDivider: { height: 1, backgroundColor: theme.border, marginHorizontal: 16 },

  // Gymkhana button
  gymkhanaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: theme.card, borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: '#f472b640', marginBottom: 8,
    borderLeftWidth: 4, borderLeftColor: '#f472b6',
  },
  gymkhanaBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  gymkhanaBtnIcon: {
    width: 46, height: 46, borderRadius: 13,
    backgroundColor: '#f472b620', alignItems: 'center', justifyContent: 'center',
  },
  gymkhanaBtnTitle: { fontSize: 15, fontWeight: '800', color: theme.textPrimary },
  gymkhanaBtnSub: { fontSize: 11, color: theme.textMuted, marginTop: 2 },
  gymkhanaBtnBadge: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: '#f472b620',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f472b650',
  },
  gymkhanaBtnBadgeText: { fontSize: 12, fontWeight: '800', color: '#f472b6' },

  // Developers
  devsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  devCard: {
    width: '47%', backgroundColor: theme.card, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: theme.border, borderTopWidth: 3,
    alignItems: 'center',
  },
  devAvatar: {
    width: 56, height: 56, borderRadius: 28, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  devInitials: { fontSize: 20, fontWeight: '900' },
  devName: { fontSize: 13, fontWeight: '800', color: theme.textPrimary, textAlign: 'center', marginBottom: 4 },
  devRole: { fontSize: 11, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  devBranch: { fontSize: 10, color: theme.textMuted, textAlign: 'center', lineHeight: 15, marginBottom: 10 },
  devLinkedInBtn: {
    borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  devLinkedInText: { fontSize: 11, fontWeight: '700' },

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
