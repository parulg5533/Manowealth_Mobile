import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, TextInput,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

function CalendarModal({ visible, selectedDate, onSelect, onClose, theme }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [viewYear, setViewYear] = useState((selectedDate || today).getFullYear());
  const [viewMonth, setViewMonth] = useState((selectedDate || today).getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const goToPrev = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const goToNext = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const isSel = (d) => {
    if (!d || !selectedDate) return false;
    return selectedDate.getDate() === d &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getFullYear() === viewYear;
  };
  const isToday = (d) => {
    if (!d) return false;
    return today.getDate() === d &&
      today.getMonth() === viewMonth &&
      today.getFullYear() === viewYear;
  };
  const isPast = (d) => {
    if (!d) return false;
    return new Date(viewYear, viewMonth, d) < today;
  };

  const s = calStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={s.sheet}>
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={goToPrev} style={s.navBtn}>
              <Text style={s.navText}>‹</Text>
            </TouchableOpacity>
            <Text style={s.monthLabel}>{MONTH_NAMES[viewMonth]} {viewYear}</Text>
            <TouchableOpacity onPress={goToNext} style={s.navBtn}>
              <Text style={s.navText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Day name headers */}
          <View style={s.row}>
            {DAY_NAMES.map(d => (
              <Text key={d} style={s.dayName}>{d}</Text>
            ))}
          </View>

          {/* Calendar grid */}
          {rows.map((row, ri) => (
            <View key={ri} style={s.row}>
              {row.map((d, ci) => {
                const past = isPast(d);
                const sel = isSel(d);
                const tod = isToday(d);
                return (
                  <TouchableOpacity
                    key={ci}
                    style={[s.cell, sel && s.cellSel, tod && !sel && s.cellToday]}
                    onPress={() => {
                      if (d && !past) {
                        onSelect(new Date(viewYear, viewMonth, d));
                        onClose();
                      }
                    }}
                    disabled={!d || past}
                  >
                    <Text style={[
                      s.cellText,
                      past && s.cellTextPast,
                      tod && !sel && s.cellTextToday,
                      sel && s.cellTextSel,
                    ]}>
                      {d || ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Text style={s.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function formatDate(date) {
  if (!date) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

function formatDisplayDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AppointmentScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const s = styles(theme);

  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
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
    if (!selectedDate || !time) {
      Toast.show({ type: 'error', text1: 'Please select date and time' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/book-appointment', {
        userId: user?.userID,
        date: selectedDate.toISOString(),
        time,
        reason,
      });
      Toast.show({ type: 'success', text1: 'Appointment booked!' });
      setSelectedDate(null);
      setTime('');
      setReason('');
      fetchAppointments();
    } catch (err) {
      console.log('Book appointment error:', JSON.stringify(err?.response?.data), err?.message);
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to book appointment';
      Toast.show({ type: 'error', text1: 'Booking failed', text2: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchAppointments(); }}
            tintColor={theme.accent}
          />
        }
      >
        <View style={s.heroBanner}>
          <Text style={s.heroTitle}>📅 Book Appointment</Text>
          <Text style={s.heroSub}>Schedule a session with your assigned counselor</Text>
        </View>

        {/* Booking Form */}
        <View style={s.card}>
          <Text style={s.cardTitle}>New Appointment</Text>

          {/* Date Picker */}
          <View style={s.fieldWrap}>
            <Text style={s.label}>Date</Text>
            <TouchableOpacity
              style={[s.input, s.dateBtn]}
              onPress={() => setShowCalendar(true)}
              activeOpacity={0.7}
            >
              <Text style={selectedDate ? s.dateBtnText : s.dateBtnPlaceholder}>
                {selectedDate ? formatDate(selectedDate) : 'Tap to select a date'}
              </Text>
              <Text style={s.calIcon}>🗓</Text>
            </TouchableOpacity>
          </View>

          {/* Time Slot */}
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

          {/* Reason */}
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
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.bookBtnText}>Book Appointment</Text>}
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointments */}
        {!fetching && appointments.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Your Appointments</Text>
            {appointments.map((apt, i) => (
              <View key={apt._id || i} style={s.aptRow}>
                <View style={[s.aptStatus, {
                  backgroundColor: apt.status === 'Completed'
                    ? theme.sage + '20' : theme.accent + '20'
                }]}>
                  <Text style={{ fontSize: 16 }}>
                    {apt.status === 'Completed' ? '✅' : '📅'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.aptDate}>
                    {formatDisplayDate(apt.date)}{apt.time ? ` — ${apt.time}` : ''}
                  </Text>
                  {apt.reason ? <Text style={s.aptReason}>{apt.reason}</Text> : null}
                  <View style={[s.aptBadge, {
                    backgroundColor: apt.status === 'Completed'
                      ? theme.sage + '20' : theme.amber + '20'
                  }]}>
                    <Text style={[s.aptBadgeText, {
                      color: apt.status === 'Completed' ? theme.sage : theme.amber
                    }]}>
                      {apt.status || 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <CalendarModal
        visible={showCalendar}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        onClose={() => setShowCalendar(false)}
        theme={theme}
      />
    </>
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
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  dateBtnText: { fontSize: 15, color: theme.textPrimary, fontWeight: '600' },
  dateBtnPlaceholder: { fontSize: 15, color: theme.textMuted },
  calIcon: { fontSize: 18 },
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

const calStyles = (theme) => StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  sheet: {
    backgroundColor: theme.card, borderRadius: 20, padding: 20,
    width: 320, borderWidth: 1, borderColor: theme.border,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 14,
  },
  navBtn: { padding: 8 },
  navText: { fontSize: 26, color: theme.accent, fontWeight: '700', lineHeight: 28 },
  monthLabel: { fontSize: 16, fontWeight: '800', color: theme.textPrimary },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 },
  dayName: {
    width: 36, textAlign: 'center',
    fontSize: 11, fontWeight: '700', color: theme.textSecondary,
  },
  cell: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
  },
  cellSel: { backgroundColor: theme.accent },
  cellToday: { borderWidth: 1.5, borderColor: theme.accent },
  cellText: { fontSize: 14, color: theme.textPrimary },
  cellTextPast: { color: theme.textMuted },
  cellTextToday: { color: theme.accent, fontWeight: '700' },
  cellTextSel: { color: '#fff', fontWeight: '700' },
  closeBtn: {
    marginTop: 14, paddingVertical: 10, borderRadius: 10,
    backgroundColor: theme.elevated, alignItems: 'center',
  },
  closeBtnText: { color: theme.textSecondary, fontWeight: '600', fontSize: 14 },
});
