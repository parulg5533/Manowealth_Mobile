import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Modal, TextInput, Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';
import CalendarTimePicker from '../../components/CalendarTimePicker';

export default function AdminDashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const { admin, logout } = useAuth();
  const s = styles(theme);

  const [users, setUsers] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [announcementCount, setAnnouncementCount] = useState(0);

  // Event modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', description: '', venue: '' });
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [postingEvent, setPostingEvent] = useState(false);

  const fetchData = async () => {
    try {
      const [usersRes, sosRes, annRes] = await Promise.all([
        api.get(`/user-admin-data/${admin?.adminID}`),
        api.get(`/get-all-sos/${admin?.adminID}`),
        api.get(`/announcements/admin/${admin?.adminID}`),
      ]);
      setUsers(usersRes.data || []);
      setSosAlerts(sosRes.data?.filter(s => !s.resolved) || []);
      setAnnouncementCount(annRes.data?.unreadCount || 0);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (admin?.adminID) fetchData(); }, [admin]);

  const handleLogout = async () => { await logout(); };

  const postEvent = async () => {
    if (!eventForm.title || !eventForm.description || !selectedDateTime) {
      Toast.show({ type: 'error', text1: 'Please fill in title, description and select a date' });
      return;
    }
    setPostingEvent(true);
    try {
      await api.post('/events', {
        title: eventForm.title.trim(),
        description: eventForm.description.trim(),
        eventDate: selectedDateTime.toISOString(),
        venue: eventForm.venue.trim() || 'TBD',
        createdByRole: 'admin',
      });
      Toast.show({ type: 'success', text1: 'Event posted successfully!' });
      setShowEventModal(false);
      setEventForm({ title: '', description: '', venue: '' });
      setSelectedDateTime(null);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to post event', text2: err?.response?.data?.message || '' });
    } finally {
      setPostingEvent(false);
    }
  };

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.success} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={theme.success} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Admin Dashboard</Text>
            <Text style={s.adminEmail}>{admin?.email}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity style={s.bellBtn} onPress={() => navigation.navigate('Notifications')} activeOpacity={0.8}>
              <Text style={s.bellIcon}>🔔</Text>
              {announcementCount > 0 && (
                <View style={s.bellBadge}><Text style={s.bellBadgeText}>{announcementCount > 9 ? '9+' : announcementCount}</Text></View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
              <Text style={s.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { borderColor: theme.success }]}>
            <Text style={[s.statNum, { color: theme.success }]}>{users.length}</Text>
            <Text style={s.statLabel}>Assigned Users</Text>
          </View>
          <View style={[s.statCard, { borderColor: '#fb7185' }]}>
            <Text style={[s.statNum, { color: '#fb7185' }]}>{sosAlerts.length}</Text>
            <Text style={s.statLabel}>SOS Alerts</Text>
          </View>
        </View>

        {/* SOS Alerts */}
        {sosAlerts.length > 0 && (
          <View style={[s.card, s.sosCard]}>
            <Text style={[s.cardTitle, { color: '#fb7185' }]}>🆘 Active SOS Alerts</Text>
            {sosAlerts.slice(0, 3).map((sos, i) => (
              <View key={sos._id || i} style={s.sosRow}>
                <Text style={s.sosUser}>{sos.userName || sos.userId}</Text>
                <Text style={s.sosTime}>{new Date(sos.createdAt).toLocaleString()}</Text>
                <Text style={s.sosMsg}>{sos.message}</Text>
              </View>
            ))}
            <TouchableOpacity style={s.viewAllBtn} onPress={() => navigation.navigate('SOSNotifications')}>
              <Text style={s.viewAllText}>View All SOS Alerts</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Quick Actions</Text>
          <View style={s.actionsGrid}>
            {[
              { icon: '👥', label: 'My Users', color: theme.success, onPress: () => navigation.navigate('UserData') },
              { icon: '🆘', label: 'SOS Alerts', color: '#fb7185', onPress: () => navigation.navigate('SOSNotifications') },
              { icon: '📅', label: 'Appointments', color: '#818cf8', onPress: () => navigation.navigate('AllAppointments') },
              { icon: '👤', label: 'Unassigned', color: theme.amber, onPress: () => navigation.navigate('UnassignedUsers') },
              { icon: '🗓️', label: 'Post Event', color: '#3ecfbe', onPress: () => setShowEventModal(true) },
            ].map(item => (
              <TouchableOpacity key={item.label} style={s.actionBtn} onPress={item.onPress}>
                <Text style={s.actionIcon}>{item.icon}</Text>
                <Text style={[s.actionLabel, { color: item.color }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Assigned Users */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Assigned Students ({users.length})</Text>
            <TouchableOpacity onPress={() => navigation.navigate('UserData')}>
              <Text style={s.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {users.slice(0, 5).map((u, i) => (
            <TouchableOpacity
              key={u._id || i}
              style={s.userRow}
              onPress={() => navigation.navigate('UserReport', { userId: u._id, userName: u.username })}
            >
              <View style={s.userAvatar}>
                <Text style={s.userAvatarText}>{u.username?.[0]?.toUpperCase() || 'U'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.userName}>{u.username}</Text>
                <Text style={s.userEmail}>{u.email}</Text>
              </View>
              {u.score != null && (
                <View style={[s.scoreBadge, {
                  borderColor: u.score >= 70 ? theme.success : u.score >= 40 ? theme.amber : theme.danger,
                }]}>
                  <Text style={[s.scoreText, {
                    color: u.score >= 70 ? theme.success : u.score >= 40 ? theme.amber : theme.danger,
                  }]}>
                    {Math.round(u.score)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <CalendarTimePicker
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onConfirm={(dt) => setSelectedDateTime(dt)}
        theme={theme}
        accentColor="#3ecfbe"
      />

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

            <Text style={s.inputLabel}>Event Name *</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Wellness Workshop"
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
              multiline
              numberOfLines={3}
            />

            <Text style={s.inputLabel}>Date & Time *</Text>
            <TouchableOpacity
              style={[s.datePickerBtn, selectedDateTime && { borderColor: '#3ecfbe' }]}
              onPress={() => setShowCalendar(true)}
            >
              <Text style={[s.datePickerText, selectedDateTime && { color: '#3ecfbe' }]}>
                {selectedDateTime
                  ? selectedDateTime.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : '📅  Tap to select date & time'}
              </Text>
            </TouchableOpacity>

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
              onPress={postEvent}
              disabled={postingEvent}
            >
              {postingEvent
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={s.postBtnText}>Post Event</Text>}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: '800', color: theme.textPrimary },
  adminEmail: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  logoutBtn: {
    backgroundColor: 'rgba(224,124,124,0.1)', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: theme.danger,
  },
  logoutText: { fontSize: 13, color: theme.danger, fontWeight: '600' },
  bellBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: theme.elevated,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border,
  },
  bellIcon: { fontSize: 16 },
  bellBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#fb7185', borderRadius: 999,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2,
  },
  bellBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: theme.card, borderRadius: 16, padding: 16, borderWidth: 1.5, alignItems: 'center' },
  statNum: { fontSize: 32, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 12, color: theme.textMuted, fontWeight: '600' },
  card: { backgroundColor: theme.card, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: theme.border },
  sosCard: { borderColor: '#fb7185', backgroundColor: 'rgba(251,113,133,0.05)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary },
  seeAll: { fontSize: 13, color: theme.accent },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: {
    width: '30%', backgroundColor: theme.elevated, borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: theme.border,
  },
  actionIcon: { fontSize: 24, marginBottom: 8 },
  actionLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  sosRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
  sosUser: { fontSize: 14, fontWeight: '700', color: '#fb7185', marginBottom: 2 },
  sosTime: { fontSize: 11, color: theme.textMuted, marginBottom: 2 },
  sosMsg: { fontSize: 13, color: theme.textSecondary },
  viewAllBtn: {
    backgroundColor: 'rgba(251,113,133,0.1)', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#fb7185',
  },
  viewAllText: { color: '#fb7185', fontWeight: '700', fontSize: 13 },
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  userAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: theme.elevated,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border,
  },
  userAvatarText: { fontSize: 16, fontWeight: '700', color: theme.success },
  userName: { fontSize: 14, fontWeight: '700', color: theme.textPrimary },
  userEmail: { fontSize: 12, color: theme.textMuted },
  scoreBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, backgroundColor: 'transparent' },
  scoreText: { fontSize: 12, fontWeight: '800' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: theme.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: theme.textPrimary },
  modalClose: { fontSize: 20, color: theme.textMuted, fontWeight: '700' },
  inputLabel: { fontSize: 12, fontWeight: '700', color: theme.textMuted, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: theme.elevated, borderRadius: 12, padding: 12,
    color: theme.textPrimary, fontSize: 14, borderWidth: 1, borderColor: theme.border,
  },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  datePickerBtn: {
    backgroundColor: theme.elevated, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: theme.border,
  },
  datePickerText: { fontSize: 14, color: theme.textMuted, fontWeight: '600' },
  postBtn: {
    backgroundColor: '#3ecfbe', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginTop: 20,
  },
  postBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
