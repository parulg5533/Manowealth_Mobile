import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { questions, answerOptions } from '../../constants/questions';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

export default function SurveyScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const s = styles(theme);

  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = (questionIndex, value) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }));
  };

  const getProgress = () => {
    const answered = Object.keys(answers).length;
    return answered / questions.length;
  };

  const handleSubmit = async () => {
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      Alert.alert(
        'Incomplete Survey',
        `You have ${unanswered} unanswered question(s). Submit anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: submitSurvey },
        ]
      );
    } else {
      submitSurvey();
    }
  };

  const submitSurvey = async () => {
    setLoading(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([idx, value]) => ({
        question: questions[parseInt(idx)],
        answer: value,
        questionIndex: parseInt(idx),
      }));

      await api.post('/survey', {
        userId: user?.userID,
        email: user?.email,
        answers: formattedAnswers,
      });

      setSubmitted(true);
      Toast.show({ type: 'success', text1: 'Survey submitted successfully!' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to submit survey' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <Text style={{ fontSize: 60, marginBottom: 20 }}>🎉</Text>
        <Text style={s.thankTitle}>Thank You!</Text>
        <Text style={s.thankText}>
          Your wellness survey has been submitted. Your counselor will review your responses.
        </Text>
        <TouchableOpacity style={s.doneBtn} onPress={() => navigation.navigate('Summary')}>
          <Text style={s.doneBtnText}>View Results →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.homeBtn} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={s.homeBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Hero Banner */}
      <View style={s.hero}>
        <View style={s.badge}><Text style={s.badgeText}>WELLNESS ASSESSMENT</Text></View>
        <Text style={s.heroTitle}>
          Psychosocial{'\n'}<Text style={s.heroAccent}>Wellness Survey</Text>
        </Text>
        <Text style={s.heroDesc}>
          This 51-item questionnaire assesses your psychological wellbeing across life satisfaction, autonomy, social connections, and physical health.
        </Text>

        {/* Chips */}
        <View style={s.chipsRow}>
          {['🔒 Confidential', '51 Questions', '~10 mins'].map(chip => (
            <View key={chip} style={s.chip}>
              <Text style={s.chipText}>{chip}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Progress */}
      <View style={s.progressWrap}>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${getProgress() * 100}%` }]} />
        </View>
        <Text style={s.progressText}>{Object.keys(answers).length} / {questions.length} answered</Text>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent}>
        {/* Questions */}
        {questions.map((q, idx) => (
          <View key={idx} style={s.questionCard}>
            <View style={s.questionHeader}>
              <View style={s.questionNum}>
                <Text style={s.questionNumText}>{idx + 1}</Text>
              </View>
              <Text style={s.questionText}>{q}</Text>
            </View>

            <View style={s.optionsWrap}>
              {answerOptions.map((opt) => {
                const selected = answers[idx] === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[s.option, selected && s.optionSelected]}
                    onPress={() => handleAnswer(idx, opt.value)}
                    activeOpacity={0.7}
                  >
                    <View style={[s.optionDot, selected && s.optionDotSelected]}>
                      {selected && <View style={s.optionDotInner} />}
                    </View>
                    <Text style={[s.optionText, selected && s.optionTextSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.submitBtnText}>Submit Survey</Text>}
        </TouchableOpacity>
        <Text style={s.footerNote}>Your responses are completely confidential and used only for wellness assessment.</Text>
      </ScrollView>
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  hero: {
    backgroundColor: theme.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    padding: 20,
    paddingTop: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(56,189,248,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.25)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 10,
  },
  badgeText: { color: '#38bdf8', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: theme.textPrimary, lineHeight: 30, marginBottom: 8 },
  heroAccent: { color: '#38bdf8', fontStyle: 'italic' },
  heroDesc: { fontSize: 13, color: theme.textSecondary, lineHeight: 20, marginBottom: 12 },
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    backgroundColor: 'rgba(52,211,153,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: { fontSize: 11, color: '#34d399', fontWeight: '600' },
  progressWrap: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  progressTrack: {
    height: 6,
    backgroundColor: theme.elevated,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: 6,
    backgroundColor: theme.accent,
    borderRadius: 3,
  },
  progressText: { fontSize: 11, color: theme.textMuted, textAlign: 'right' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  questionCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  questionHeader: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  questionNum: {
    width: 28, height: 28,
    backgroundColor: theme.accent,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  questionNumText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  questionText: { flex: 1, fontSize: 14, color: theme.textPrimary, lineHeight: 22, fontWeight: '500' },
  optionsWrap: { gap: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.elevated,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    padding: 12,
  },
  optionSelected: {
    backgroundColor: 'rgba(124,131,224,0.12)',
    borderColor: theme.accent,
  },
  optionDot: {
    width: 18, height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionDotSelected: { borderColor: theme.accent },
  optionDotInner: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: theme.accent,
  },
  optionText: { fontSize: 14, color: theme.textSecondary, flex: 1 },
  optionTextSelected: { color: theme.textPrimary, fontWeight: '600' },
  submitBtn: {
    backgroundColor: theme.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  footerNote: { fontSize: 12, color: theme.textMuted, textAlign: 'center', lineHeight: 18 },
  thankTitle: { fontSize: 28, fontWeight: '900', color: theme.textPrimary, marginBottom: 12, textAlign: 'center' },
  thankText: { fontSize: 16, color: theme.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 28 },
  doneBtn: {
    backgroundColor: theme.accent,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  homeBtn: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  homeBtnText: { color: theme.textSecondary, fontSize: 15, fontWeight: '600' },
});
