import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

export default function AppointmentScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const s = styles(theme);

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await api.get(`/get-appointments/${user?.userID}`);
      setAppointments(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setFetching(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (user?.userID) fetchAppointments(); }, [user]);

  const handleBook = async () => {
    if (!date || !time) {
      Toast.show({ type: 'error', text1: 'Please select date and time' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/book-appointment', {
        userId: user?.userID,
        date,
        time,
        reason,
      });
      Toast.show({ type: 'success', text1: 'Appointment booked!' });
      setDate('');
      setTime('');
      setReason('');
      fetchAppointments();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to book appointment' });
    } finally {
      setLoading(false);
    }
  };

  const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAppointments(); }} tintColor={theme.accent} />}
    >
      <View style={s.heroBanner}>
        <Text style={s.heroTitle}>📅 Book Appointment</Text>
        <Text style={s.heroSub}>Schedule a session with your assigned counselor</Text>
      </View>

      {/* Booking Form */}
      <View style={s.card}>
        <Text style={s.cardTitle}>New Appointment</Text>

        <View style={s.fieldWrap}>
          <Text style={s.label}>Date (DD/MM/YYYY)</Text>
          <TextInput
            style={s.input}
            value={date}
            onChangeText={setDate}
            placeholder="e.g. 15/04/2025"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        <View style={s.fieldWrap}>
          <Text style={s.label}>Time Slot</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={s.slotsRow}>
              {TIME_SLOTS.map(slot => (
                <TouchableOpacity
                  key={slot}
                  style={[s.slot, time === slot && s.slotSelected]}
                  onPress={() => setTime(slot)}
                >
                  <Text style={[s.slotText, time === slot && s.slotTextSelected]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={s.fieldWrap}>
          <Text style={s.label}>Reason (optional)</Text>
          <TextInput
            style={[s.input, s.textarea]}
            value={reason}
            onChangeText={setReason}
            placeholder="What would you like to discuss?"
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={s.bookBtn} onPress={handleBook} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.bookBtnText}>Book Appointment</Text>}
        </TouchableOpacity>
      </View>

      {/* Upcoming Appointments */}
      {!fetching && appointments.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Your Appointments</Text>
          {appointments.map((apt, i) => (
            <View key={apt._id || i} style={s.aptRow}>
              <View style={[s.aptStatus, { backgroundColor: apt.status === 'completed' ? theme.sage + '20' : theme.accent + '20' }]}>
                <Text style={{ fontSize: 16 }}>
                  {apt.status === 'completed' ? '✅' : '📅'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.aptDate}>{apt.date} — {apt.time}</Text>
                {apt.reason && <Text style={s.aptReason}>{apt.reason}</Text>}
                <View style={[s.aptBadge, { backgroundColor: apt.status === 'completed' ? theme.sage + '20' : theme.amber + '20' }]}>
                  <Text style={[s.aptBadgeText, { color: apt.status === 'completed' ? theme.sage : theme.amber }]}>
                    {apt.status || 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
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
  heroTitle: { fontSize: 22, fontWeight: '900', color: theme.textPrimary, marginBottom: 6 },
  heroSub: { fontSize: 14, color: theme.textSecondary, lineHeight: 20 },
  card: {
    backgroundColor: theme.card, borderRadius: 18, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: theme.border,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary, marginBottom: 16 },
  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: theme.elevated, borderWidth: 1, borderColor: theme.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 15, color: theme.textPrimary,
  },
  textarea: { minHeight: 80, paddingTop: 12 },
  slotsRow: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
  slot: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: theme.elevated, borderRadius: 10,
    borderWidth: 1, borderColor: theme.border,
  },
  slotSelected: { backgroundColor: theme.accent + '20', borderColor: theme.accent },
  slotText: { fontSize: 13, color: theme.textSecondary, fontWeight: '500' },
  slotTextSelected: { color: theme.accent, fontWeight: '700' },
  bookBtn: {
    backgroundColor: theme.accent, borderRadius: 14, paddingVertical: 15, alignItems: 'center',
  },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  aptRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  aptStatus: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  aptDate: { fontSize: 14, fontWeight: '700', color: theme.textPrimary, marginBottom: 2 },
  aptReason: { fontSize: 13, color: theme.textSecondary, marginBottom: 4 },
  aptBadge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  aptBadgeText: { fontSize: 11, fontWeight: '700' },
});
