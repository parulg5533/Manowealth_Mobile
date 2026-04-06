import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

function ScoreGauge({ score, label, color, maxScore = 100 }) {
  const { theme } = useTheme();
  const pct = Math.min(100, Math.max(0, (score / maxScore) * 100));

  const getInterpretation = () => {
    if (label === 'PHQ-9') {
      if (score <= 4) return { text: 'Minimal', color: theme.sage };
      if (score <= 9) return { text: 'Mild', color: theme.amber };
      if (score <= 14) return { text: 'Moderate', color: theme.warn };
      return { text: 'Severe', color: theme.danger };
    }
    if (label === 'GAD-7') {
      if (score <= 4) return { text: 'Minimal', color: theme.sage };
      if (score <= 9) return { text: 'Mild', color: theme.amber };
      if (score <= 14) return { text: 'Moderate', color: theme.warn };
      return { text: 'Severe', color: theme.danger };
    }
    if (pct >= 70) return { text: 'Good', color: theme.sage };
    if (pct >= 40) return { text: 'Moderate', color: theme.amber };
    return { text: 'Low', color: theme.danger };
  };

  const interp = getInterpretation();

  return (
    <View style={[gaugeStyles.wrap, { borderColor: color }]}>
      <Text style={[gaugeStyles.score, { color }]}>{Math.round(score)}</Text>
      <Text style={gaugeStyles.label}>{label}</Text>
      <View style={gaugeStyles.track}>
        <View style={[gaugeStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <View style={[gaugeStyles.badge, { backgroundColor: `${interp.color}20`, borderColor: interp.color }]}>
        <Text style={[gaugeStyles.badgeText, { color: interp.color }]}>{interp.text}</Text>
      </View>
    </View>
  );
}

const gaugeStyles = StyleSheet.create({
  wrap: {
    flex: 1, minWidth: '44%', backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16, padding: 16, borderWidth: 1.5, alignItems: 'center',
  },
  score: { fontSize: 36, fontWeight: '900' },
  label: { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginBottom: 10 },
  track: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
  fill: { height: 6, borderRadius: 3 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});

export default function SummaryScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const s = styles(theme);

  const [data, setData] = useState(null);
  const [surveyAnswers, setSurveyAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get(`/get-user-info/${user?.userID}`);
      setData(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (user?.userID) fetchData(); }, [user]);

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  const hasScores = data?.score != null || data?.who5_score != null;

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={theme.accent} />}
    >
      <View style={s.heroBanner}>
        <View style={s.badge}><Text style={s.badgeText}>ASSESSMENT RESULTS</Text></View>
        <Text style={s.heroTitle}>Your Wellness{'\n'}<Text style={s.heroAccent}>Summary</Text></Text>
        <Text style={s.heroSub}>
          Based on your psychosocial wellness survey responses
        </Text>
      </View>

      {hasScores ? (
        <>
          {/* Main score */}
          {data.score != null && (
            <View style={s.mainScoreCard}>
              <Text style={s.mainScoreLabel}>Overall Wellness Score</Text>
              <Text style={[s.mainScore, {
                color: data.score >= 70 ? theme.sage : data.score >= 40 ? theme.amber : theme.danger,
              }]}>
                {Math.round(data.score)}
              </Text>
              <View style={s.mainScoreTrack}>
                <View style={[s.mainScoreFill, {
                  width: `${Math.min(100, data.score)}%`,
                  backgroundColor: data.score >= 70 ? theme.sage : data.score >= 40 ? theme.amber : theme.danger,
                }]} />
              </View>
              <Text style={s.scoreDate}>
                Last assessed: {data.score_date ? new Date(data.score_date).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          )}

          {/* Score Grid */}
          <View style={s.scoresGrid}>
            {data.who5_score != null && (
              <ScoreGauge score={data.who5_score} label="WHO-5" color={theme.sage} maxScore={25} />
            )}
            {data.phq9_score != null && (
              <ScoreGauge score={data.phq9_score} label="PHQ-9" color="#fb7185" maxScore={27} />
            )}
            {data.gad7_score != null && (
              <ScoreGauge score={data.gad7_score} label="GAD-7" color="#818cf8" maxScore={21} />
            )}
            {data.score != null && (
              <ScoreGauge score={data.score} label="Overall" color={theme.accent} />
            )}
          </View>

          {/* Interpretation */}
          <View style={s.interpretCard}>
            <Text style={s.cardTitle}>What this means</Text>
            <Text style={s.interpretText}>
              {data.score >= 70
                ? "Your wellness score indicates good psychological wellbeing. Continue maintaining healthy habits and seeking balance in your life."
                : data.score >= 40
                ? "Your score suggests moderate wellbeing. There are some areas that may benefit from additional support. Consider speaking with a counselor."
                : "Your score indicates you may be experiencing significant challenges. We strongly encourage you to reach out to your assigned counselor for support."}
            </Text>
          </View>

          <TouchableOpacity style={s.retakeBtn} onPress={() => navigation.navigate('Survey')}>
            <Text style={s.retakeBtnText}>Retake Survey</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={s.emptyCard}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📋</Text>
          <Text style={s.emptyTitle}>No Results Yet</Text>
          <Text style={s.emptyText}>
            Complete the wellness survey to see your assessment results here.
          </Text>
          <TouchableOpacity style={s.surveyBtn} onPress={() => navigation.navigate('Survey')}>
            <Text style={s.surveyBtnText}>Take Survey Now →</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 16, paddingBottom: 40 },
  heroBanner: {
    backgroundColor: theme.card, borderRadius: 18, padding: 22, marginBottom: 14,
    borderWidth: 1, borderColor: theme.border,
  },
  badge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(56,189,248,0.1)',
    borderWidth: 1, borderColor: 'rgba(56,189,248,0.25)', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 3, marginBottom: 10,
  },
  badgeText: { color: '#38bdf8', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { fontSize: 26, fontWeight: '900', color: theme.textPrimary, lineHeight: 32, marginBottom: 8 },
  heroAccent: { color: '#38bdf8', fontStyle: 'italic' },
  heroSub: { fontSize: 14, color: theme.textSecondary, lineHeight: 20 },
  mainScoreCard: {
    backgroundColor: theme.card, borderRadius: 18, padding: 22, marginBottom: 14,
    borderWidth: 1, borderColor: theme.border, alignItems: 'center',
  },
  mainScoreLabel: { fontSize: 14, color: theme.textMuted, fontWeight: '600', marginBottom: 8 },
  mainScore: { fontSize: 64, fontWeight: '900', marginBottom: 12 },
  mainScoreTrack: {
    width: '100%', height: 8,
    backgroundColor: theme.elevated, borderRadius: 4, overflow: 'hidden', marginBottom: 8,
  },
  mainScoreFill: { height: 8, borderRadius: 4 },
  scoreDate: { fontSize: 12, color: theme.textMuted },
  scoresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  interpretCard: {
    backgroundColor: theme.card, borderRadius: 18, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: theme.border,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary, marginBottom: 10 },
  interpretText: { fontSize: 15, color: theme.textSecondary, lineHeight: 24 },
  retakeBtn: {
    backgroundColor: theme.accent, borderRadius: 14, paddingVertical: 15, alignItems: 'center',
  },
  retakeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  emptyCard: {
    backgroundColor: theme.card, borderRadius: 18, padding: 32,
    borderWidth: 1, borderColor: theme.border, alignItems: 'center',
  },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: theme.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  surveyBtn: { backgroundColor: theme.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24 },
  surveyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
