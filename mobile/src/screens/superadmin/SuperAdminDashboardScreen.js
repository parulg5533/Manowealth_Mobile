import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert, Pressable,
  Modal, TextInput, Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

export default function SuperAdminDashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const { superAdmin, logout } = useAuth();
  const s = styles(theme);

  const [stats, setStats] = useState({ users: 0, admins: 0, surveys: 0, sos: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Events state
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventsListModal, setShowEventsListModal] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', description: '', eventDate: '', venue: '' });
  const [postingEvent, setPostingEvent] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState(null);

  const fetchData = async () => {
    try {
      const [usersRes, adminsRes, eventsRes] = await Promise.all([
        api.get('/getAllUsers'),
        api.get('/getAllAdmins'),
        api.get('/events'),
      ]);
      const users = usersRes.data || [];
      const admins = adminsRes.data || [];
      setStats({
        users: users.length,
        admins: admins.length,
        surveys: users.filter(u => u.score != null).length,
        sos: 0,
      });
      setRecentUsers(users.slice(0, 6));
      setEvents(eventsRes.data?.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const postEvent = async () => {
    if (!eventForm.title || !eventForm.description || !eventForm.eventDate) {
      Toast.show({ type: 'error', text1: 'Please fill in title, description and date' });
      return;
    }
    setPostingEvent(true);
    try {
      await api.post('/events', {
        title: eventForm.title,
        description: eventForm.description,
        eventDate: new Date(eventForm.eventDate).toISOString(),
        venue: eventForm.venue || 'TBD',
        createdByRole: 'superadmin',  // triggers notifications to all users
      });
      Toast.show({ type: 'success', text1: '✅ Event posted!', text2: 'All students have been notified.' });
      setShowEventModal(false);
      setEventForm({ title: '', description: '', eventDate: '', venue: '' });
      fetchData();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to post event', text2: err?.response?.data?.message || '' });
    } finally {
      setPostingEvent(false);
    }
  };

  const deleteEvent = (eventId, title) => {
    Alert.alert('Delete Event', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setDeletingEventId(eventId);
          try {
            await api.delete(`/events/${eventId}`);
            setEvents(prev => prev.filter(e => e._id !== eventId));
            Toast.show({ type: 'success', text1: 'Event deleted' });
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to delete event' });
          } finally {
            setDeletingEventId(null);
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={[{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.warn} />
      </View>
    );
  }

  const MENU_ITEMS = [
    { icon: '👥', label: 'All Students', color: theme.accent, onPress: () => navigation.navigate('AllUsers') },
    { icon: '👤', label: 'All Admins', color: theme.success, onPress: () => navigation.navigate('AllAdmins') },
    { icon: '➕', label: 'Add Admin', color: theme.sage, onPress: () => navigation.navigate('AddAdmin') },
    { icon: '🆘', label: 'SOS Logs', color: '#fb7185', onPress: () => navigation.navigate('AllSOSLogs') },
    { icon: '📅', label: 'Appointments', color: '#818cf8', onPress: () => navigation.navigate('AllAppointments') },
    { icon: '🤝', label: 'Help Friend', color: theme.teal, onPress: () => navigation.navigate('HelpAFriendEntries') },
    { icon: '🗓️', label: 'Post Event', color: '#3ecfbe', onPress: () => setShowEventModal(true) },
    { icon: '📋', label: 'Manage Events', color: '#f0a96a', onPress: () => setShowEventsListModal(true) },
  ];

  return (
    <>
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={theme.warn} />}
    >
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Super Admin</Text>
          <Text style={s.subEmail}>{superAdmin?.email}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [s.logoutBtn, { opacity: pressed ? 0.6 : 1 }]}
          onPress={handleLogout}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={s.logoutText}>Logout</Text>
        </Pressable>
      </View>

      {/* Stats Grid */}
      <View style={s.statsGrid}>
        {[
          { label: 'Students', value: stats.users, color: theme.accent },
          { label: 'Admins', value: stats.admins, color: theme.success },
          { label: 'Surveys', value: stats.surveys, color: '#38bdf8' },
          { label: 'Unassigned', value: stats.users - stats.surveys, color: theme.warn },
        ].map(item => (
          <View key={item.label} style={[s.statCard, { borderColor: item.color }]}>
            <Text style={[s.statNum, { color: item.color }]}>{item.value}</Text>
            <Text style={s.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Menu Grid */}
      <Text style={s.sectionTitle}>Management</Text>
      <View style={s.menuGrid}>
        {MENU_ITEMS.map(item => (
          <TouchableOpacity
            key={item.label}
            style={s.menuBtn}
            onPress={item.onPress}
            activeOpacity={0.8}
          >
            <Text style={s.menuIcon}>{item.icon}</Text>
            <Text style={[s.menuLabel, { color: item.color }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Students */}
      {recentUsers.length > 0 && (
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Recent Students</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllUsers')}>
              <Text style={s.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentUsers.map((u, i) => (
            <View key={u._id || i} style={s.userRow}>
              <View style={s.userAvatar}>
                <Text style={s.userAvatarText}>{u.username?.[0]?.toUpperCase() || 'U'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.userName}>{u.username}</Text>
                <Text style={s.userEmail}>{u.email}</Text>
              </View>
              {u.score != null && (
                <Text style={[s.userScore, {
                  color: u.score >= 70 ? theme.sage : u.score >= 40 ? theme.amber : theme.danger,
                }]}>
                  {Math.round(u.score)}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>

    {/* Post Event Modal */}
    <Modal visible={showEventModal} transparent animationType="slide">
      <View style={s.modalOverlay}>
        <View style={s.modalCard}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>🗓️  Post an Event</Text>
            <TouchableOpacity onPress={() => setShowEventModal(false)}>
              <Text style={s.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={s.notifNote}>
            <Text style={s.notifNoteText}>🔔 All students will be notified when you post an event.</Text>
          </View>

          <Text style={s.inputLabel}>Event Name *</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Mental Health Awareness Day"
            placeholderTextColor={theme.textMuted}
            value={eventForm.title}
            onChangeText={v => setEventForm(f => ({ ...f, title: v }))}
          />
          <Text style={s.inputLabel}>Description *</Text>
          <TextInput
            style={[s.input, s.textArea]}
            placeholder="Brief description of the event"
            placeholderTextColor={theme.textMuted}
            value={eventForm.description}
            onChangeText={v => setEventForm(f => ({ ...f, description: v }))}
            multiline numberOfLines={3}
          />
          <Text style={s.inputLabel}>Date (YYYY-MM-DD) *</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. 2025-05-20"
            placeholderTextColor={theme.textMuted}
            value={eventForm.eventDate}
            onChangeText={v => setEventForm(f => ({ ...f, eventDate: v }))}
          />
          <Text style={s.inputLabel}>Venue</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Lecture Hall 1, IIT Patna"
            placeholderTextColor={theme.textMuted}
            value={eventForm.venue}
            onChangeText={v => setEventForm(f => ({ ...f, venue: v }))}
          />
          <TouchableOpacity
            style={[s.postBtn, postingEvent && { opacity: 0.6 }]}
            onPress={postEvent} disabled={postingEvent}
          >
            {postingEvent
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={s.postBtnText}>Post & Notify Students</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

    {/* Manage Events Modal */}
    <Modal visible={showEventsListModal} transparent animationType="slide">
      <View style={s.modalOverlay}>
        <View style={[s.modalCard, { maxHeight: '80%' }]}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>📋  Manage Events</Text>
            <TouchableOpacity onPress={() => setShowEventsListModal(false)}>
              <Text style={s.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {events.length === 0 ? (
              <Text style={s.noEventsText}>No events posted yet.</Text>
            ) : events.map(ev => (
              <View key={ev._id} style={s.eventListRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.eventListTitle}>{ev.title}</Text>
                  <Text style={s.eventListMeta}>
                    🗓 {new Date(ev.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {'   '}📍 {ev.venue || ev.location || 'TBD'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={s.deleteBtn}
                  onPress={() => deleteEvent(ev._id, ev.title)}
                  disabled={deletingEventId === ev._id}
                >
                  {deletingEventId === ev._id
                    ? <ActivityIndicator size="small" color="#fb7185" />
                    : <Text style={s.deleteBtnText}>Delete</Text>}
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[s.postBtn, { marginTop: 16 }]}
            onPress={() => { setShowEventsListModal(false); setShowEventModal(true); }}
          >
            <Text style={s.postBtnText}>+ Post New Event</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: theme.warn },
  subEmail: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  logoutBtn: {
    backgroundColor: 'rgba(224,124,124,0.1)', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: theme.danger,
  },
  logoutText: { fontSize: 13, color: theme.danger, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1, minWidth: '44%', backgroundColor: theme.card, borderRadius: 16, padding: 14,
    borderWidth: 1.5, alignItems: 'center',
  },
  statNum: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 12, color: theme.textMuted, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary, marginBottom: 12 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  menuBtn: {
    width: '30%', backgroundColor: theme.card, borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: theme.border,
  },
  menuIcon: { fontSize: 24, marginBottom: 6 },
  menuLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  card: {
    backgroundColor: theme.card, borderRadius: 18, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: theme.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary },
  seeAll: { fontSize: 13, color: theme.accent },
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  userAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: theme.elevated, alignItems: 'center', justifyContent: 'center',
  },
  userAvatarText: { fontSize: 15, fontWeight: '700', color: theme.warn },
  userName: { fontSize: 14, fontWeight: '700', color: theme.textPrimary },
  userEmail: { fontSize: 12, color: theme.textMuted },
  userScore: { fontSize: 18, fontWeight: '900' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: theme.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: theme.textPrimary },
  modalClose: { fontSize: 20, color: theme.textMuted, fontWeight: '700' },
  notifNote: {
    backgroundColor: '#3ecfbe18', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: '#3ecfbe44', marginBottom: 8,
  },
  notifNoteText: { fontSize: 12, color: '#3ecfbe', fontWeight: '600' },
  inputLabel: { fontSize: 12, fontWeight: '700', color: theme.textMuted, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: theme.elevated, borderRadius: 12, padding: 12,
    color: theme.textPrimary, fontSize: 14, borderWidth: 1, borderColor: theme.border,
  },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  postBtn: {
    backgroundColor: '#3ecfbe', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginTop: 20,
  },
  postBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  noEventsText: { textAlign: 'center', color: theme.textMuted, fontSize: 14, paddingVertical: 20 },
  eventListRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  eventListTitle: { fontSize: 14, fontWeight: '700', color: theme.textPrimary, marginBottom: 4 },
  eventListMeta: { fontSize: 12, color: theme.textMuted },
  deleteBtn: {
    backgroundColor: '#fb718520', borderRadius: 8, borderWidth: 1, borderColor: '#fb7185',
    paddingHorizontal: 12, paddingVertical: 6,
  },
  deleteBtnText: { color: '#fb7185', fontSize: 12, fontWeight: '700' },
});
