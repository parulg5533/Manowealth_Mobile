import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

const MOOD_METRICS = [
  { key: 'mood', label: 'Overall Mood', emoji: '😊', color: '#6ecb8a' },
  { key: 'stress', label: 'Stress Level', emoji: '😰', color: '#fb7185' },
  { key: 'sleep', label: 'Sleep Quality', emoji: '😴', color: '#818cf8' },
  { key: 'energy', label: 'Energy Level', emoji: '⚡', color: '#fbbf24' },
  { key: 'appetite', label: 'Appetite', emoji: '🍎', color: '#3ecfbe' },
];

function Slider({ value, onChange, color }) {
  const { theme } = useTheme();
  const steps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 11, color: theme.textMuted }}>Low</Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color }}>
          {value}
        </Text>
        <Text style={{ fontSize: 11, color: theme.textMuted }}>High</Text>
      </View>
      <View style={sliderStyles.track}>
        <View style={[sliderStyles.fill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
      <View style={sliderStyles.stepsRow}>
        {steps.map(step => (
          <TouchableOpacity key={step} onPress={() => onChange(step)} style={sliderStyles.stepBtn}>
            <View style={[
              sliderStyles.stepDot,
              value >= step && { backgroundColor: color },
            ]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  track: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  fill: { height: 8, borderRadius: 4 },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stepBtn: { padding: 4 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
});

export default function MoodTrackerScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const s = styles(theme);

  const [values, setValues] = useState({ mood: 50, stress: 50, sleep: 50, energy: 50, appetite: 50 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/get-mood-logs/${user?.userID}`);
      setLogs(res.data?.logs?.slice(0, 14) || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (user?.userID) fetchLogs();
  }, [user]);

  const onRefresh = () => { setRefreshing(true); fetchLogs(); };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/log-mood', {
        userId: user?.userID,
        ...values,
      });
      Toast.show({ type: 'success', text1: 'Mood logged successfully!' });
      fetchLogs();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to log mood' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
    >
      <View style={s.heroBanner}>
        <Text style={s.heroTitle}>Mood Tracker</Text>
        <Text style={s.heroSub}>Log how you're feeling today across 5 dimensions</Text>
      </View>

      {/* Sliders */}
      <View style={s.sliderCard}>
        <Text style={s.sectionTitle}>How are you feeling today?</Text>
        {MOOD_METRICS.map(metric => (
          <View key={metric.key} style={s.metricRow}>
            <View style={s.metricHeader}>
              <Text style={s.metricEmoji}>{metric.emoji}</Text>
              <Text style={s.metricLabel}>{metric.label}</Text>
            </View>
            <Slider
              value={values[metric.key]}
              onChange={(val) => setValues(prev => ({ ...prev, [metric.key]: val }))}
              color={metric.color}
            />
          </View>
        ))}

        <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={submitting}>
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.submitBtnText}>Log My Mood</Text>}
        </TouchableOpacity>
      </View>

      {/* History */}
      {logs.length > 0 && (
        <View style={s.historyCard}>
          <Text style={s.sectionTitle}>Recent Mood Logs</Text>
          {logs.map((log, i) => (
            <View key={i} style={s.logRow}>
              <Text style={s.logDate}>
                {new Date(log.createdAt).toLocaleDateString('en', {
                  month: 'short', day: 'numeric', weekday: 'short',
                })}
              </Text>
              <View style={s.logBars}>
                {MOOD_METRICS.map(m => (
                  <View key={m.key} style={s.logBarWrap}>
                    <View style={[s.logBar, {
                      height: Math.max(4, (log[m.key] / 100) * 40),
                      backgroundColor: m.color,
                    }]} />
                    <Text style={s.logBarLabel}>{m.emoji}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.logAvg}>
                Avg: {Math.round(Object.values(MOOD_METRICS).reduce((sum, m) => sum + (log[m.key] || 0), 0) / MOOD_METRICS.length)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 16, paddingBottom: 32 },
  heroBanner: {
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  heroTitle: { fontSize: 26, fontWeight: '900', color: theme.textPrimary, marginBottom: 6 },
  heroSub: { fontSize: 14, color: theme.textSecondary, lineHeight: 20 },
  sliderCard: {
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary, marginBottom: 16 },
  metricRow: { marginBottom: 20 },
  metricHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  metricEmoji: { fontSize: 20 },
  metricLabel: { fontSize: 15, fontWeight: '600', color: theme.textPrimary },
  submitBtn: {
    backgroundColor: theme.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  historyCard: {
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 10,
  },
  logDate: { width: 70, fontSize: 11, color: theme.textMuted, lineHeight: 15 },
  logBars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 48, justifyContent: 'center' },
  logBarWrap: { alignItems: 'center', gap: 2 },
  logBar: { width: 20, borderRadius: 4 },
  logBarLabel: { fontSize: 9 },
  logAvg: { width: 50, fontSize: 11, color: theme.textMuted, textAlign: 'right' },
});
