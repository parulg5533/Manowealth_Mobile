import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

const QUOTES = [
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela", category: "Resilience", color: "#7c83e0" },
  { text: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.", author: "Noam Shpancer", category: "Mindfulness", color: "#3ecfbe" },
  { text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, or frustrated.", author: "Lori Deschene", category: "Self-Compassion", color: "#6ecb8a" },
  { text: "Self-care is not self-indulgence, it is self-preservation.", author: "Audre Lorde", category: "Wellness", color: "#f0a96a" },
  { text: "Healing takes time, and asking for help is a courageous step.", author: "Mariska Hargitay", category: "Courage", color: "#fb7185" },
  { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush", category: "Growth", color: "#a78bfa" },
  { text: "Not until we are lost do we begin to understand ourselves.", author: "Henry David Thoreau", category: "Self-Discovery", color: "#38bdf8" },
  { text: "Promise me you'll always remember: you're braver than you believe, stronger than you seem.", author: "A.A. Milne", category: "Strength", color: "#f472b6" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function UserDashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const s = styles(theme);

  const [profile, setProfile] = useState(null);
  const [moodLogs, setMoodLogs] = useState([]);
  const [quoteIdx, setQuoteIdx] = useState(Math.floor(Math.random() * QUOTES.length));
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [profileRes, moodRes] = await Promise.all([
        api.get(`/get-user-info/${user?.userID}`),
        api.get(`/get-mood-logs/${user?.userID}`),
      ]);
      setProfile(profileRes.data);
      setMoodLogs(moodRes.data?.logs?.slice(0, 7) || []);
    } catch (err) {
      console.log('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (user?.userID) fetchData(); }, [user]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const nextQuote = () => setQuoteIdx(i => (i + 1) % QUOTES.length);
  const prevQuote = () => setQuoteIdx(i => (i - 1 + QUOTES.length) % QUOTES.length);

  const sendSOS = async () => {
    if (!user?.assigned_admin) {
      Toast.show({ type: 'error', text1: 'No counselor assigned yet', text2: 'Please contact admin to get a counselor assigned' });
      return;
    }
    try {
      await api.post('/send-sos', {
        userId: user?.userID,
        admin: user?.assigned_admin,
        message: 'I need help urgently!',
        username: user?.username,
      });
      Toast.show({ type: 'success', text1: 'SOS sent to your counselor' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to send SOS' });
    }
  };

  const quote = QUOTES[quoteIdx];

  const actionItems = [
    { icon: '📋', label: 'Survey', color: theme.accent, bg: theme.accent + '20', onPress: () => navigation.navigate('Survey') },
    { icon: '😊', label: 'Mood Log', color: theme.sage, bg: theme.sage + '20', onPress: () => navigation.navigate('MoodTracker') },
    { icon: '🤖', label: 'Chatbot', color: theme.teal, bg: theme.teal + '20', onPress: () => navigation.navigate('Chatbot') },
    { icon: '📅', label: 'Appointment', color: theme.amber, bg: theme.amber + '20', onPress: () => navigation.navigate('Appointment') },
    { icon: '🤝', label: 'Help Friend', color: '#fb7185', bg: '#fb718520', onPress: () => navigation.navigate('HelpAFriend') },
    { icon: '📊', label: 'My Results', color: '#a78bfa', bg: '#a78bfa20', onPress: () => navigation.navigate('Summary') },
  ];

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
    >
      {/* Profile Card — bg4 wellness illustration on right */}
      <View style={s.profileCard}>
        <View style={s.profileContent}>
          <Text style={s.greetingLabel}>{getGreeting()}</Text>
          <Text style={s.greetingName}>{user?.username || 'Student'} 👋</Text>
          <Text style={s.greetingSub}>How are you feeling today?</Text>
          {profile?.score != null && (
            <View style={[s.scorePill, { backgroundColor: theme.sage + '20', borderColor: theme.sage + '50' }]}>
              <Text style={s.scoreDot}>●</Text>
              <Text style={[s.scoreText, { color: theme.sage }]}>Wellness Score: {Math.round(profile.score)}</Text>
            </View>
          )}
        </View>
        <Image
          source={require('../../../assets/bg4.png')}
          style={s.profileIllustration}
          resizeMode="cover"
        />
      </View>

      {/* Quick Actions */}
      <Text style={s.sectionTitle}>Quick Actions</Text>
      <View style={s.actionsGrid}>
        {actionItems.map((item) => (
          <TouchableOpacity key={item.label} style={[s.actionBtn, { borderColor: item.color + '40' }]} onPress={item.onPress} activeOpacity={0.75}>
            <View style={[s.actionIconWrap, { backgroundColor: item.bg }]}>
              <Text style={s.actionIcon}>{item.icon}</Text>
            </View>
            <Text style={[s.actionLabel, { color: item.color }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quote Card — img illustration on right */}
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

          <View style={s.quoteAuthorRow}>
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
                  <View style={[s.quoteDot, { backgroundColor: i === quoteIdx ? quote.color : theme.border, width: i === quoteIdx ? 14 : 5 }]} />
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
          source={require('../../../assets/img.png')}
          style={s.quoteIllustration}
          resizeMode="cover"
        />
      </View>

      {/* Mood Summary */}
      {moodLogs.length > 0 && (
        <View style={s.moodCard}>
          <View style={s.cardTitleRow}>
            <Text style={s.cardTitle}>Recent Mood</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MoodTracker')}>
              <Text style={[s.cardLink, { color: theme.sage }]}>View all →</Text>
            </TouchableOpacity>
          </View>
          <View style={s.moodRow}>
            {moodLogs.slice(0, 7).map((log, i) => {
              const barH = Math.max(8, (log.mood / 100) * 70);
              const opacity = 0.4 + (i / moodLogs.length) * 0.6;
              return (
                <View key={i} style={s.moodItem}>
                  <Text style={s.moodValue}>{log.mood}</Text>
                  <View style={s.moodBarTrack}>
                    <View style={[s.moodBar, { height: barH, backgroundColor: theme.sage, opacity }]} />
                  </View>
                  <Text style={s.moodDay}>{new Date(log.createdAt).toLocaleDateString('en', { weekday: 'short' })}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* SOS Button */}
      <TouchableOpacity style={s.sosBtn} onPress={sendSOS} activeOpacity={0.8}>
        <View style={s.sosContent}>
          <Text style={s.sosIcon}>🆘</Text>
          <View>
            <Text style={s.sosBtnText}>Send SOS Alert</Text>
            <Text style={s.sosSubText}>Notify your counselor immediately</Text>
          </View>
        </View>
        <Text style={s.sosArrow}>›</Text>
      </TouchableOpacity>

      {/* Counselor Card */}
      {user?.assigned_admin && (
        <View style={[s.counselorCard, { borderLeftColor: theme.teal }]}>
          <Text style={s.counselorIcon}>👨‍⚕️</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.counselorTitle}>Your Counselor</Text>
            <Text style={s.counselorText}>A counselor is assigned to support your wellness journey.</Text>
          </View>
          <View style={[s.counselorBadge, { backgroundColor: theme.teal + '20' }]}>
            <Text style={[s.counselorBadgeText, { color: theme.teal }]}>Active</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 16, paddingBottom: 36 },

  // Profile card — split layout with illustration
  profileCard: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 20, borderWidth: 1, borderColor: theme.border,
    overflow: 'hidden', marginBottom: 20, minHeight: 150,
  },
  profileContent: { flex: 1, padding: 18, justifyContent: 'center' },
  greetingLabel: { fontSize: 12, color: theme.textMuted, fontWeight: '500', marginBottom: 2 },
  greetingName: { fontSize: 20, fontWeight: '800', color: theme.textPrimary, marginBottom: 4 },
  greetingSub: { fontSize: 13, color: theme.textSecondary, fontStyle: 'italic', marginBottom: 10 },
  scorePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  scoreDot: { fontSize: 8, color: '#6ecb8a' },
  scoreText: { fontSize: 12, fontWeight: '700' },
  profileIllustration: { width: 120, alignSelf: 'stretch' },

  // Actions
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary, marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  actionBtn: {
    width: '30.5%', backgroundColor: theme.card, borderRadius: 16,
    padding: 14, alignItems: 'center', borderWidth: 1,
  },
  actionIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionIcon: { fontSize: 24 },
  actionLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  // Quote card — split layout with illustration
  quoteCard: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 20, borderWidth: 1, borderColor: theme.border,
    borderTopWidth: 3, overflow: 'hidden', marginBottom: 16,
    minHeight: 230,
  },
  quoteContent: { flex: 1, padding: 18 },
  quoteTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  categoryPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  categoryText: { fontSize: 11, fontWeight: '700' },
  quoteCounter: { fontSize: 11, color: theme.textMuted, fontWeight: '600' },
  quoteBgMark: { fontSize: 48, fontWeight: '900', lineHeight: 46, marginBottom: 2, opacity: 0.25 },
  quoteBody: { fontSize: 14, color: theme.textPrimary, fontStyle: 'italic', lineHeight: 22, marginBottom: 14 },
  quoteAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  quoteAccentBar: { width: 18, height: 2.5, borderRadius: 1 },
  quoteAuthor: { fontSize: 12, fontWeight: '700' },
  quoteNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quoteNavBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  quoteNavText: { fontSize: 20, fontWeight: '700', lineHeight: 22 },
  quoteDotRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  quoteDot: { height: 5, borderRadius: 3 },
  quoteIllustration: { width: 110, alignSelf: 'stretch' },

  // Mood card
  moodCard: {
    backgroundColor: theme.card, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: theme.border, marginBottom: 16,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: theme.textPrimary },
  cardLink: { fontSize: 13, fontWeight: '600' },
  moodRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' },
  moodItem: { alignItems: 'center', gap: 4 },
  moodValue: { fontSize: 9, color: theme.textMuted, fontWeight: '600' },
  moodBarTrack: { width: 24, height: 70, justifyContent: 'flex-end' },
  moodBar: { width: 24, borderRadius: 6 },
  moodDay: { fontSize: 10, color: theme.textMuted },

  // SOS
  sosBtn: {
    backgroundColor: '#fb718514', borderWidth: 1.5, borderColor: '#fb7185',
    borderRadius: 18, padding: 16, marginBottom: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  sosContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sosIcon: { fontSize: 28 },
  sosBtnText: { fontSize: 16, fontWeight: '800', color: '#fb7185' },
  sosSubText: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  sosArrow: { fontSize: 24, color: '#fb7185', fontWeight: '700' },

  // Counselor card
  counselorCard: {
    backgroundColor: theme.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: theme.border, borderLeftWidth: 4,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16,
  },
  counselorIcon: { fontSize: 28 },
  counselorTitle: { fontSize: 14, fontWeight: '800', color: theme.textPrimary, marginBottom: 2 },
  counselorText: { fontSize: 13, color: theme.textSecondary, lineHeight: 18 },
  counselorBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  counselorBadgeText: { fontSize: 11, fontWeight: '700' },
});
