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
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { text: "Mental health is not a destination, but a process. It's about how you drive, not where you're going.", author: "Noam Shpancer" },
  { text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated.", author: "Lori Deschene" },
  { text: "Self-care is not self-indulgence, it is self-preservation.", author: "Audre Lorde" },
  { text: "Healing takes time, and asking for help is a courageous step.", author: "Mariska Hargitay" },
];

export default function UserDashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const s = styles(theme);

  const [profile, setProfile] = useState(null);
  const [moodLogs, setMoodLogs] = useState([]);
  const [quoteIdx] = useState(Math.floor(Math.random() * QUOTES.length));
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [profileRes, moodRes] = await Promise.all([
        api.get(`/get-user-info/${user?.userID}`),
        api.get(`/get-mood-logs/${user?.userID}`),
      ]);
      setProfile(profileRes.data);
      setMoodLogs(moodRes.data?.slice(0, 7) || []);
    } catch (err) {
      console.log('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (user?.userID) fetchData(); }, [user]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const sendSOS = async () => {
    try {
      await api.post('/send-sos', { userId: user?.userID, message: 'I need help urgently!' });
      Toast.show({ type: 'success', text1: '🆘 SOS sent to your counselor' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to send SOS' });
    }
  };

  const quote = QUOTES[quoteIdx];

  const actionItems = [
    { icon: '📋', label: 'Take Survey', color: theme.accent, onPress: () => navigation.navigate('Survey') },
    { icon: '😊', label: 'Mood Log', color: theme.sage, onPress: () => navigation.navigate('MoodTracker') },
    { icon: '🤖', label: 'Chatbot', color: theme.teal, onPress: () => navigation.navigate('Chatbot') },
    { icon: '📅', label: 'Appointment', color: theme.amber, onPress: () => navigation.navigate('Appointment') },
    { icon: '🤝', label: 'Help Friend', color: '#fb7185', onPress: () => navigation.navigate('HelpAFriend') },
    { icon: '📊', label: 'My Results', color: '#818cf8', onPress: () => navigation.navigate('Summary') },
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
      {/* Profile Card */}
      <View style={s.profileCard}>
        <View style={s.avatarRing}>
          <View style={s.avatarInner}>
            <Text style={s.avatarText}>{user?.username?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
        </View>
        <View style={s.greetingWrap}>
          <Text style={s.greeting}>
            Hello, <Text style={s.greetingName}>{user?.username || 'Student'}</Text> 👋
          </Text>
          <Text style={s.greetingSub}>How are you feeling today?</Text>
          {profile?.score != null && (
            <View style={s.scoreBadge}>
              <Text style={s.scoreText}>Wellness Score: {Math.round(profile.score)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={s.sectionTitle}>Quick Actions</Text>
      <View style={s.actionsGrid}>
        {actionItems.map((item) => (
          <TouchableOpacity key={item.label} style={s.actionBtn} onPress={item.onPress}>
            <Text style={s.actionIcon}>{item.icon}</Text>
            <Text style={[s.actionLabel, { color: item.color }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quote Card */}
      <View style={s.quoteCard}>
        <Text style={s.quoteMark}>"</Text>
        <Text style={s.quoteText}>{quote.text}</Text>
        <Text style={s.quoteAuthor}>— {quote.author}</Text>
      </View>

      {/* Mood Summary */}
      {moodLogs.length > 0 && (
        <View style={s.moodCard}>
          <Text style={s.cardTitle}>Recent Mood</Text>
          <View style={s.moodRow}>
            {moodLogs.slice(0, 5).map((log, i) => (
              <View key={i} style={s.moodItem}>
                <View style={[s.moodBar, { height: Math.max(8, (log.mood / 100) * 60), backgroundColor: theme.sage }]} />
                <Text style={s.moodDay}>{new Date(log.createdAt).toLocaleDateString('en', { weekday: 'short' })}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* SOS Button */}
      <TouchableOpacity style={s.sosBtn} onPress={sendSOS}>
        <Text style={s.sosBtnText}>🆘  Send SOS Alert</Text>
        <Text style={s.sosSubText}>Notify your counselor immediately</Text>
      </TouchableOpacity>

      {/* Admin Info */}
      {user?.assigned_admin && (
        <View style={s.adminCard}>
          <Text style={s.cardTitle}>Your Counselor</Text>
          <Text style={s.adminText}>You have a counselor assigned to support your wellness journey.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 16, paddingBottom: 32 },
  profileCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 20,
  },
  avatarRing: {
    width: 68, height: 68,
    borderRadius: 34,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  avatarInner: {
    width: 62, height: 62,
    borderRadius: 31,
    backgroundColor: theme.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 26, fontWeight: '800', color: theme.accent },
  greetingWrap: { flex: 1 },
  greeting: { fontSize: 20, fontWeight: '700', color: theme.textPrimary },
  greetingName: { color: theme.sage },
  greetingSub: { fontSize: 14, color: theme.textSecondary, marginTop: 2, fontStyle: 'italic' },
  scoreBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(110,203,138,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(110,203,138,0.4)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 8,
  },
  scoreText: { fontSize: 12, color: theme.sage, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary, marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  actionBtn: {
    width: '30.5%',
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  actionIcon: { fontSize: 26, marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  quoteCard: {
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 16,
  },
  quoteMark: { fontSize: 40, color: theme.teal, lineHeight: 40, marginBottom: 4 },
  quoteText: { fontSize: 15, color: theme.textPrimary, fontStyle: 'italic', lineHeight: 24, marginBottom: 12 },
  quoteAuthor: { fontSize: 13, color: theme.teal, fontWeight: '700' },
  moodCard: {
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: theme.textPrimary, marginBottom: 14 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 70 },
  moodItem: { alignItems: 'center', gap: 4 },
  moodBar: { width: 28, borderRadius: 6 },
  moodDay: { fontSize: 10, color: theme.textMuted },
  sosBtn: {
    backgroundColor: 'rgba(251,113,133,0.12)',
    borderWidth: 1.5,
    borderColor: '#fb7185',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  sosBtnText: { fontSize: 17, fontWeight: '800', color: '#fb7185', marginBottom: 4 },
  sosSubText: { fontSize: 12, color: theme.textMuted },
  adminCard: {
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 16,
  },
  adminText: { fontSize: 14, color: theme.textSecondary, marginBottom: 12 },
  adminBtn: {
    backgroundColor: theme.accent,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  adminBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
