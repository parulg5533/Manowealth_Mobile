import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';
import { questions as FALLBACK_QUESTIONS } from '../../constants/questions';

const ANSWER_OPTIONS = [
  { label: 'Strongly Agree', score: 5 },
  { label: 'Agree', score: 4 },
  { label: 'Undecided', score: 3 },
  { label: 'Disagree', score: 2 },
  { label: 'Strongly Disagree', score: 1 },
];

export default function ChatbotScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const s = styles(theme);
  const scrollRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch questions from API, fall back to hardcoded list if empty or error
    api.get('/getQ')
      .then(res => {
        const qs = (res.data || []).map(q => q.text).filter(Boolean);
        setQuestions(qs.length > 0 ? qs : FALLBACK_QUESTIONS);
        setLoading(false);
      })
      .catch(() => {
        setQuestions(FALLBACK_QUESTIONS);
        setLoading(false);
      });

    // Check if already answered this month
    if (user?.userID) {
      api.get(`/user/get-score/${user.userID}`)
        .then(res => {
          if (res.data?.score) {
            const diff = Math.floor((new Date() - new Date(res.data.date)) / 86400000);
            if (diff < 30) {
              setAlreadyAnswered(true);
              setDaysLeft(30 - diff);
            }
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Typing animation when question changes
  useEffect(() => {
    if (currentIndex < questions.length) {
      setIsTyping(true);
      const t = setTimeout(() => setIsTyping(false), 600);
      return () => clearTimeout(t);
    }
  }, [currentIndex, questions]);

  // Auto scroll
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [answers, isTyping, showThankYou]);

  const handleAnswer = (option) => {
    const newAnswers = [...answers, { question: questions[currentIndex], answer: option.label }];
    setAnswers(newAnswers);
    setUserScore(prev => prev + option.score);
    if (currentIndex === questions.length - 1) {
      setShowThankYou(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleUndo = () => {
    if (showThankYou) setShowThankYou(false);
    setAnswers(prev => prev.slice(0, -1));
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleRestart = () => {
    setAnswers([]);
    setCurrentIndex(0);
    setUserScore(0);
    setShowThankYou(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/Doit', {
        email: user?.email,
        answers,
        score: userScore,
      });
      Toast.show({ type: 'success', text1: 'Survey submitted successfully!' });
      navigation.navigate('Summary');
    } catch (err) {
      console.log('Submit error:', JSON.stringify(err?.response?.data), err?.message);
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit';
      Toast.show({ type: 'error', text1: 'Failed to submit', text2: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const progress = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;

  if (loading) {
    return (
      <View style={[{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{ color: theme.textMuted, marginTop: 12 }}>Loading questions...</Text>
      </View>
    );
  }

  if (alreadyAnswered) {
    return (
      <View style={[{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <Text style={{ fontSize: 48, marginBottom: 20 }}>⏳</Text>
        <Text style={[s.thankTitle, { textAlign: 'center' }]}>Already Submitted</Text>
        <Text style={[s.thankText, { textAlign: 'center' }]}>
          You can retake the survey in{'\n'}<Text style={{ color: theme.accent, fontWeight: '800' }}>{daysLeft} days</Text>
        </Text>
        <TouchableOpacity style={s.submitBtn} onPress={() => navigation.navigate('Summary')}>
          <Text style={s.submitBtnText}>View My Results →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Top Bar */}
      <View style={s.topBar}>
        <View style={s.topLeft}>
          <View style={s.avatarWrap}>
            <Image source={require('../../../assets/bot.png')} style={s.botAvatar} />
            <View style={s.onlineDot} />
          </View>
          <View>
            <Text style={s.botName}>Wellness Survey</Text>
            <Text style={s.botStatus}>● {questions.length > 0 ? `${currentIndex}/${questions.length} answered` : 'Loading...'}</Text>
          </View>
        </View>
        <View style={s.topRight}>
          {answers.length > 0 && (
            <TouchableOpacity style={s.iconBtn} onPress={handleUndo}>
              <Text style={s.iconBtnText}>↩ Undo</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.iconBtn} onPress={handleRestart}>
            <Text style={s.iconBtnText}>↺ Restart</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={s.progressWrap}>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollRef}
        style={s.chatArea}
        contentContainerStyle={s.chatContent}
      >
        {/* Intro message */}
        <View style={s.msgRow}>
          <View style={s.botAvatarSmall}><Text style={{ fontSize: 14 }}>🤖</Text></View>
          <View style={s.bubbleBot}>
            <Text style={s.bubbleText}>
              Hello! I'm here to assess your wellness. Please answer each question honestly. Your responses are completely confidential. 🔒
            </Text>
          </View>
        </View>

        {/* Past answered questions */}
        {answers.map((item, i) => (
          <React.Fragment key={i}>
            <View style={s.msgRow}>
              <View style={s.botAvatarSmall}><Text style={{ fontSize: 14 }}>🤖</Text></View>
              <View style={s.bubbleBot}>
                <Text style={s.questionNum}>Q{i + 1}</Text>
                <Text style={s.bubbleText}>{item.question}</Text>
              </View>
            </View>
            <View style={[s.msgRow, s.msgRowUser]}>
              <View style={s.bubbleUser}>
                <Text style={s.bubbleUserText}>{item.answer}</Text>
              </View>
            </View>
          </React.Fragment>
        ))}

        {/* Current question or thank you */}
        {!showThankYou && currentIndex < questions.length && (
          <View style={s.msgRow}>
            <View style={s.botAvatarSmall}><Text style={{ fontSize: 14 }}>🤖</Text></View>
            {isTyping ? (
              <View style={s.bubbleBot}>
                <View style={s.typingDots}>
                  <View style={s.dot} /><View style={[s.dot, { opacity: 0.6 }]} /><View style={[s.dot, { opacity: 0.3 }]} />
                </View>
              </View>
            ) : (
              <View style={s.bubbleBot}>
                <Text style={s.questionNum}>Q{currentIndex + 1} of {questions.length}</Text>
                <Text style={s.bubbleText}>{questions[currentIndex]}</Text>
              </View>
            )}
          </View>
        )}

        {showThankYou && (
          <View style={s.msgRow}>
            <View style={s.botAvatarSmall}><Text style={{ fontSize: 14 }}>🤖</Text></View>
            <View style={s.bubbleBot}>
              <Text style={s.bubbleText}>
                🎉 You've answered all {questions.length} questions! Thank you for completing the wellness survey. Press submit to save your results.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Answer options or submit */}
      {!isTyping && !showThankYou && currentIndex < questions.length && (
        <View style={s.optionsArea}>
          {ANSWER_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.label}
              style={s.optionBtn}
              onPress={() => handleAnswer(opt)}
              activeOpacity={0.75}
            >
              <Text style={s.optionText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showThankYou && (
        <View style={s.submitArea}>
          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={submitting}>
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.submitBtnText}>Submit & See Results →</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: theme.card, paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: { position: 'relative' },
  botAvatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: theme.teal },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 10, height: 10, backgroundColor: theme.sage,
    borderRadius: 5, borderWidth: 2, borderColor: theme.card,
  },
  botName: { fontSize: 15, fontWeight: '700', color: theme.textPrimary },
  botStatus: { fontSize: 11, color: theme.sage, fontWeight: '500' },
  topRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    backgroundColor: theme.elevated, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: theme.border,
  },
  iconBtnText: { fontSize: 12, color: theme.textSecondary, fontWeight: '600' },
  progressWrap: {
    paddingHorizontal: 16, paddingVertical: 6,
    backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  progressTrack: { height: 5, backgroundColor: theme.elevated, borderRadius: 3 },
  progressFill: { height: 5, backgroundColor: theme.accent, borderRadius: 3 },
  chatArea: { flex: 1, backgroundColor: theme.bg },
  chatContent: { padding: 16, gap: 12, paddingBottom: 20 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser: { justifyContent: 'flex-end' },
  botAvatarSmall: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: theme.border, flexShrink: 0,
  },
  bubbleBot: {
    maxWidth: '80%', backgroundColor: theme.card,
    borderRadius: 18, borderBottomLeftRadius: 4,
    padding: 14, borderWidth: 1, borderColor: theme.border,
  },
  bubbleUser: {
    maxWidth: '70%', backgroundColor: '#1d4ed8',
    borderRadius: 18, borderBottomRightRadius: 4, padding: 12,
  },
  questionNum: { fontSize: 11, color: theme.accent, fontWeight: '700', marginBottom: 4 },
  bubbleText: { fontSize: 15, color: theme.textPrimary, lineHeight: 22 },
  bubbleUserText: { fontSize: 15, color: '#fff', fontWeight: '600' },
  typingDots: { flexDirection: 'row', gap: 5, padding: 4 },
  dot: { width: 8, height: 8, backgroundColor: theme.textMuted, borderRadius: 4 },
  optionsArea: {
    backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border,
    padding: 12, gap: 8,
  },
  optionBtn: {
    backgroundColor: theme.card, borderRadius: 12,
    padding: 13, borderWidth: 1, borderColor: theme.border,
    alignItems: 'center',
  },
  optionText: { fontSize: 15, color: theme.textPrimary, fontWeight: '600' },
  submitArea: {
    backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.border, padding: 16,
  },
  submitBtn: {
    backgroundColor: theme.accent, borderRadius: 14, paddingVertical: 15, alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  thankTitle: { fontSize: 26, fontWeight: '900', color: theme.textPrimary, marginBottom: 12 },
  thankText: { fontSize: 16, color: theme.textSecondary, lineHeight: 26, marginBottom: 28 },
});
