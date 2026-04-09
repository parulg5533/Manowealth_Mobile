import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, RefreshControl, ActivityIndicator, Linking, Animated,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

const TEAM = [
  { name: 'Jimson Mathew', role: 'Dean, Student Affairs', email: 'dean_sa@iitp.ac.in', initials: 'JM', color: '#7c83e0', emoji: '🎓' },
  { name: 'Aditya', role: 'Counselor', email: 'counselor2@iitp.ac.in', initials: 'AD', color: '#3ecfbe', emoji: '💙' },
  { name: 'Mahendar Ram', role: 'PIC Wellness', email: 'pic_wellness@iitp.ac.in', initials: 'MR', color: '#f0a96a', emoji: '🌿' },
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

const DEVELOPERS = [
  {
    name: 'Parul Garg',
    role: 'Developer',
    initials: 'PG',
    color: '#7c83e0',
    linkedin: 'https://www.linkedin.com/in/parul-garg-iitp',
  },
  {
    name: 'Mihika Saxena',
    role: 'Developer',
    initials: 'MS',
    color: '#f472b6',
    linkedin: 'https://www.linkedin.com/in/mihika-saxena-b5bb8a28b/',
  },
];

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
  const [events, setEvents] = useState([]);
  const [unreadEventCount, setUnreadEventCount] = useState(0);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [eventIdx, setEventIdx] = useState(0);
  const [gymkhanaOpen, setGymkhanaOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [profileRes, moodRes, eventsRes] = await Promise.all([
        api.get(`/get-user-info/${user?.userID}`),
        api.get(`/get-mood-logs/${user?.userID}`),
        api.get('/events'),
      ]);
      setProfile(profileRes.data);
      setMoodLogs(moodRes.data?.logs?.slice(0, 7) || []);
      const sorted = (eventsRes.data?.data || []).sort(
        (a, b) => new Date(a.eventDate) - new Date(b.eventDate)
      );
      setEvents(sorted);
      setEventIdx(0);
    } catch (err) {
      console.log('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchNotifications = async () => {
    if (!user?.userID) return;
    try {
      const [evNotifRes, annRes] = await Promise.all([
        api.get(`/events/notifications/${user.userID}`),
        api.get(`/announcements/user/${user.userID}`),
      ]);
      setUnreadEventCount(evNotifRes.data?.count || 0);
      setAnnouncementCount(annRes.data?.unreadCount || 0);
    } catch {}
  };

  const markNotifsRead = async () => {
    if (!user?.userID || unreadEventCount === 0) return;
    try {
      await api.patch(`/events/notifications/read/${user.userID}`);
      setUnreadEventCount(0);
    } catch {}
  };

  useEffect(() => {
    if (user?.userID) {
      fetchData();
      fetchNotifications();
    }
  }, [user]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

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
          <View style={s.profileTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.greetingLabel}>{getGreeting()}</Text>
              <Text style={s.greetingName}>{user?.username || 'Student'} 👋</Text>
            </View>
            <TouchableOpacity style={s.bellBtn} onPress={() => navigation.navigate('Notifications')} activeOpacity={0.8}>
              <Text style={s.bellIcon}>🔔</Text>
              {(announcementCount > 0) && (
                <View style={s.bellBadge}><Text style={s.bellBadgeText}>{announcementCount > 9 ? '9+' : announcementCount}</Text></View>
              )}
            </TouchableOpacity>
          </View>
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
          resizeMode="contain"
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

      {/* Upcoming Events */}
      <TouchableOpacity
        style={s.eventsSectionHeader}
        onPress={markNotifsRead}
        activeOpacity={1}
      >
        <Text style={s.sectionTitle}>📅  Upcoming Events</Text>
        {unreadEventCount > 0 && (
          <View style={s.unreadBadge}>
            <Text style={s.unreadBadgeText}>{unreadEventCount} new</Text>
          </View>
        )}
      </TouchableOpacity>
      {events.length === 0 ? (
        <View style={s.noEventsCard}>
          <Text style={s.noEventsEmoji}>📭</Text>
          <Text style={s.noEventsText}>No upcoming events right now</Text>
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
                  <Text style={s.eventIconEmoji}>📅</Text>
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

      {/* Quote Card — img illustration on right */}
      <View style={[s.quoteCard, { borderTopColor: quote.color }]}>
        {/* Left: text */}
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
            <View style={s.quoteAuthorRow}>
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
          resizeMode="contain"
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

      {/* Meet the Team */}
      <View style={s.teamSection}>
        <View style={s.devHeaderRow}>
          <Text style={s.devSectionTitle}>🏛️  Meet the Team</Text>
          <View style={[s.devBadge, { backgroundColor: '#3ecfbe20' }]}>
            <Text style={[s.devBadgeText, { color: '#3ecfbe' }]}>IIT Patna</Text>
          </View>
        </View>
        <Text style={s.devSectionSub}>The people supporting your wellness</Text>
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
        <View style={s.gymkhanaSection}>
          {GYMKHANA.map((member, idx) => (
            <View key={member.name + idx}>
              <View style={s.gymRow}>
                <View style={[s.gymAvatar, { backgroundColor: member.color + '20', borderColor: member.color + '50' }]}>
                  <Text style={[s.gymInitials, { color: member.color }]}>{member.initials}</Text>
                </View>
                <View style={s.gymInfo}>
                  <Text style={s.gymName}>{member.name}</Text>
                  <View style={[s.gymRolePill, { backgroundColor: member.color + '18', borderColor: member.color + '40' }]}>
                    <Text style={[s.gymRoleText, { color: member.color }]}>{member.role}</Text>
                  </View>
                  {member.rollNo ? <Text style={s.gymRoll}>{member.rollNo}</Text> : null}
                </View>
              </View>
              {idx < GYMKHANA.length - 1 && <View style={s.teamDivider} />}
            </View>
          ))}
        </View>
      )}

      {/* Meet the Developers */}
      <View style={s.devSection}>
        <View style={s.devHeaderRow}>
          <Text style={s.devSectionTitle}>👨‍💻  Meet the Developers</Text>
          <View style={s.devBadge}>
            <Text style={s.devBadgeText}>IIT Patna</Text>
          </View>
        </View>
        <Text style={s.devSectionSub}>The team behind Manowealth</Text>
        <View style={s.devsRow}>
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
              <View style={[s.devLinkedInBtn, { backgroundColor: dev.color + '18', borderColor: dev.color + '44' }]}>
                <Text style={[s.devLinkedInText, { color: dev.color }]}>in  LinkedIn →</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
  profileTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  greetingLabel: { fontSize: 12, color: theme.textMuted, fontWeight: '500', marginBottom: 2 },
  greetingName: { fontSize: 20, fontWeight: '800', color: theme.textPrimary, marginBottom: 4 },
  greetingSub: { fontSize: 13, color: theme.textSecondary, fontStyle: 'italic', marginBottom: 10 },
  bellBtn: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: theme.elevated,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border,
    marginTop: 2,
  },
  bellIcon: { fontSize: 16 },
  bellBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#fb7185', borderRadius: 999,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2,
  },
  bellBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  scorePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  scoreDot: { fontSize: 8, color: '#6ecb8a' },
  scoreText: { fontSize: 12, fontWeight: '700' },
  profileIllustration: { width: 100, height: 120, alignSelf: 'center' },

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
  quoteIllustration: { width: 82, height: 130, alignSelf: 'center' },

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

  // Events carousel
  eventsSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  unreadBadge: { backgroundColor: '#fb7185', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  unreadBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  noEventsCard: {
    backgroundColor: theme.card, borderRadius: 14, padding: 20,
    alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: theme.border,
  },
  noEventsEmoji: { fontSize: 28, marginBottom: 6 },
  noEventsText: { fontSize: 13, color: theme.textMuted, fontWeight: '600' },
  eventCarousel: {
    backgroundColor: theme.card, borderRadius: 20, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: theme.border, borderTopWidth: 3,
  },
  eventCarouselTop: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  eventIconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  eventIconEmoji: { fontSize: 20 },
  eventTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginBottom: 4 },
  eventTitle: { fontSize: 14, fontWeight: '800', color: theme.textPrimary, flex: 1 },
  eventNewPill: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  eventNewText: { fontSize: 9, fontWeight: '800' },
  eventDesc: { fontSize: 12, color: theme.textSecondary, lineHeight: 17 },
  eventMetaDivider: { height: 1, marginBottom: 10 },
  eventMeta: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginBottom: 12 },
  eventMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventMetaIcon: { fontSize: 11 },
  eventMetaText: { fontSize: 11, fontWeight: '700' },
  eventNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  eventNavBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  eventNavText: { fontSize: 20, fontWeight: '700', lineHeight: 22 },
  eventDotRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventDot: { height: 5, borderRadius: 3 },
  eventCounter: { fontSize: 10, fontWeight: '600', textAlign: 'right' },

  // Meet the Team section
  teamSection: {
    backgroundColor: theme.card, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: theme.border, marginBottom: 12,
  },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  teamAvatar: {
    width: 46, height: 46, borderRadius: 23, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  teamEmoji: { fontSize: 20 },
  teamInfo: { flex: 1, gap: 3 },
  teamName: { fontSize: 13, fontWeight: '800', color: theme.textPrimary },
  teamRolePill: {
    alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  teamRoleText: { fontSize: 10, fontWeight: '700' },
  teamEmailRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  teamEmailIcon: { fontSize: 10, color: theme.textMuted },
  teamEmail: { fontSize: 11, fontWeight: '600' },
  teamArrow: { fontSize: 20, fontWeight: '700' },
  teamDivider: { height: 1, backgroundColor: theme.border },

  // Developers section
  devSection: {
    backgroundColor: theme.card, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: theme.border, marginBottom: 8,
  },
  devHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  devSectionTitle: { fontSize: 15, fontWeight: '800', color: theme.textPrimary },
  devBadge: { backgroundColor: theme.accent + '20', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  devBadgeText: { fontSize: 10, fontWeight: '700', color: theme.accent },
  devSectionSub: { fontSize: 12, color: theme.textMuted, marginBottom: 16 },
  devsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  devCard: {
    width: '47%', backgroundColor: theme.bg, borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: theme.border, borderTopWidth: 2,
    alignItems: 'center',
  },
  devAvatar: {
    width: 52, height: 52, borderRadius: 26, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  devInitials: { fontSize: 18, fontWeight: '900' },
  devName: { fontSize: 12, fontWeight: '800', color: theme.textPrimary, textAlign: 'center', marginBottom: 3 },
  devRole: { fontSize: 10, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  devLinkedInBtn: {
    borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  devLinkedInText: { fontSize: 10, fontWeight: '700' },

  // Gymkhana
  gymkhanaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: theme.card, borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: '#f472b640', marginBottom: 8,
    borderLeftWidth: 4, borderLeftColor: '#f472b6',
  },
  gymkhanaBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  gymkhanaBtnIcon: {
    width: 44, height: 44, borderRadius: 13,
    backgroundColor: '#f472b620', alignItems: 'center', justifyContent: 'center',
  },
  gymkhanaBtnTitle: { fontSize: 14, fontWeight: '800', color: theme.textPrimary },
  gymkhanaBtnSub: { fontSize: 11, color: theme.textMuted, marginTop: 2 },
  gymkhanaBtnBadge: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: '#f472b620',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f472b650',
  },
  gymkhanaBtnBadgeText: { fontSize: 11, fontWeight: '800', color: '#f472b6' },
  gymkhanaSection: {
    backgroundColor: theme.card, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 6,
    borderWidth: 1, borderColor: theme.border, marginBottom: 12,
  },
  gymRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  gymAvatar: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  gymInitials: { fontSize: 14, fontWeight: '900' },
  gymInfo: { flex: 1, gap: 3 },
  gymName: { fontSize: 13, fontWeight: '800', color: theme.textPrimary },
  gymRolePill: {
    alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  gymRoleText: { fontSize: 9, fontWeight: '700' },
  gymRoll: { fontSize: 10, color: theme.textMuted, fontWeight: '600' },

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
