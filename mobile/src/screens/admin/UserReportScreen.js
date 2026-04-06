import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/api';

export default function UserReportScreen({ route, navigation }) {
  const { userId, userName } = route.params;
  const { theme } = useTheme();
  const s = styles(theme);

  const [userData, setUserData] = useState(null);
  const [moodLogs, setMoodLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    try {
      const [userRes, moodRes] = await Promise.all([
        api.get(`/get-user-info/${userId}`),
        api.get(`/get-mood-logs/${userId}`),
      ]);
      setUserData(userRes.data);
      setMoodLogs(moodRes.data?.logs?.slice(0, 14) || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [userId]);

  if (loading) {
    return (
      <View style={[{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.success} />
      </View>
    );
  }

  const TABS = ['overview', 'mood', 'demographics'];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Tabs */}
      <View style={s.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={theme.success} />
        }
      >
        {activeTab === 'overview' && userData && (
          <>
            {/* User Card */}
            <View style={s.userCard}>
              <View style={s.userAvatar}>
                <Text style={s.avatarText}>{userData.username?.[0]?.toUpperCase() || 'U'}</Text>
              </View>
              <Text style={s.userName}>{userData.username}</Text>
              <Text style={s.userEmail}>{userData.email}</Text>
            </View>

            {/* Scores */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Assessment Scores</Text>
              <View style={s.scoresRow}>
                {[
                  { label: 'Overall', value: userData.score, color: theme.accent },
                  { label: 'WHO-5', value: userData.who5_score, color: theme.sage },
                  { label: 'PHQ-9', value: userData.phq9_score, color: '#fb7185' },
                  { label: 'GAD-7', value: userData.gad7_score, color: '#818cf8' },
                ].filter(s => s.value != null).map(item => (
                  <View key={item.label} style={[s.scoreItem, { borderColor: item.color }]}>
                    <Text style={[s.scoreVal, { color: item.color }]}>{Math.round(item.value)}</Text>
                    <Text style={s.scoreLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {activeTab === 'mood' && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Mood History</Text>
            {moodLogs.length === 0 ? (
              <Text style={s.emptyText}>No mood logs found</Text>
            ) : moodLogs.map((log, i) => (
              <View key={i} style={s.moodRow}>
                <Text style={s.moodDate}>
                  {new Date(log.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </Text>
                <View style={s.moodBars}>
                  {[
                    { key: 'mood', color: theme.sage },
                    { key: 'stress', color: '#fb7185' },
                    { key: 'sleep', color: '#818cf8' },
                    { key: 'energy', color: '#fbbf24' },
                    { key: 'appetite', color: theme.teal },
                  ].map(m => (
                    <View key={m.key} style={s.moodBarWrap}>
                      <View style={[s.moodBar, {
                        height: Math.max(4, (log[m.key] / 100) * 48),
                        backgroundColor: m.color,
                      }]} />
                    </View>
                  ))}
                </View>
                <Text style={s.moodAvg}>
                  {Math.round((log.mood + log.stress + log.sleep + log.energy + log.appetite) / 5)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'demographics' && userData && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Demographic Information</Text>
            {[
              { label: 'Degree', value: userData.degree },
              { label: 'Department', value: userData.department },
              { label: 'Semester', value: userData.semester },
              { label: 'Gender', value: userData.gender },
              { label: 'Age', value: userData.age },
            ].filter(f => f.value).map(f => (
              <View key={f.label} style={s.infoRow}>
                <Text style={s.infoLabel}>{f.label}</Text>
                <Text style={s.infoValue}>{f.value}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  tabs: {
    flexDirection: 'row', backgroundColor: theme.surface,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: theme.success },
  tabText: { fontSize: 14, color: theme.textMuted, fontWeight: '600' },
  tabTextActive: { color: theme.success },
  content: { padding: 16, paddingBottom: 32, gap: 14 },
  userCard: {
    backgroundColor: theme.card, borderRadius: 18, padding: 22,
    borderWidth: 1, borderColor: theme.border, alignItems: 'center',
  },
  userAvatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: theme.elevated, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: theme.success, marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: theme.success },
  userName: { fontSize: 20, fontWeight: '800', color: theme.textPrimary, marginBottom: 4 },
  userEmail: { fontSize: 14, color: theme.textMuted },
  card: {
    backgroundColor: theme.card, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: theme.border,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary, marginBottom: 14 },
  scoresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  scoreItem: {
    flex: 1, minWidth: '44%', backgroundColor: theme.elevated,
    borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1.5,
  },
  scoreVal: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
  scoreLabel: { fontSize: 12, color: theme.textMuted, fontWeight: '600' },
  moodRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  moodDate: { width: 60, fontSize: 11, color: theme.textMuted },
  moodBars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 52 },
  moodBarWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 52 },
  moodBar: { width: '100%', maxWidth: 20, borderRadius: 3 },
  moodAvg: { width: 28, fontSize: 12, color: theme.textMuted, textAlign: 'right' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  infoLabel: { fontSize: 14, color: theme.textMuted },
  infoValue: { fontSize: 14, color: theme.textPrimary, fontWeight: '600' },
  emptyText: { fontSize: 14, color: theme.textMuted, textAlign: 'center', paddingVertical: 20 },
});
