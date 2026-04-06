import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

const STATUS_COLORS = {
  Pending: '#f59e0b',
  Confirmed: '#3b82f6',
  Completed: '#10b981',
  Cancelled: '#ef4444',
};

export default function AllAppointmentsScreen() {
  const { theme } = useTheme();
  const { admin, superAdmin } = useAuth();
  const s = styles(theme);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    try {
      let res;
      if (superAdmin) {
        res = await api.get('/superadmin/all-appointments');
      } else {
        res = await api.get(`/admin/appointments/${admin?.adminID}`);
      }
      setAppointments(res.data || []);
    } catch (err) {
      console.log('Appointments fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleMarkComplete = (id) => {
    Alert.alert('Mark Complete', 'Mark this appointment as completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete', onPress: async () => {
          try {
            await api.patch(`/superadmin/mark-appointment-complete/${id}`);
            Toast.show({ type: 'success', text1: 'Marked as completed' });
            fetchAppointments();
          } catch (err) {
            Toast.show({ type: 'error', text1: 'Failed to update' });
          }
        }
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const statusColor = STATUS_COLORS[item.status] || theme.textMuted;
    const isPending = item.status === 'Pending' || item.status === 'Confirmed';

    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={s.avatarWrap}>
            <Text style={s.avatarText}>
              {(item.studentName || item.userName || 'S')[0].toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.studentName}>{item.studentName || item.userName || 'Student'}</Text>
            <Text style={s.studentEmail}>{item.studentEmail || item.email || ''}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
            <Text style={[s.badgeText, { color: statusColor }]}>{item.status || 'Pending'}</Text>
          </View>
        </View>

        <View style={s.divider} />

        <View style={s.detailRow}>
          <Text style={s.detailIcon}>📅</Text>
          <Text style={s.detailText}>
            {item.date ? new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
          </Text>
        </View>

        {superAdmin && item.adminName && (
          <View style={s.detailRow}>
            <Text style={s.detailIcon}>👤</Text>
            <Text style={s.detailText}>Counselor: {item.adminName}</Text>
          </View>
        )}

        {isPending && superAdmin && (
          <TouchableOpacity style={s.completeBtn} onPress={() => handleMarkComplete(item._id)}>
            <Text style={s.completeBtnText}>✓ Mark as Completed</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <FlatList
      data={appointments}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={s.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchAppointments(); }}
          tintColor={theme.accent}
        />
      }
      ListHeaderComponent={
        <View style={s.header}>
          <Text style={s.headerTitle}>📅 Appointment Logs</Text>
          <Text style={s.headerSub}>{appointments.length} total appointments</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={s.empty}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text>
          <Text style={s.emptyText}>No appointments yet</Text>
        </View>
      }
    />
  );
}

const styles = (theme) => StyleSheet.create({
  list: { padding: 16, paddingBottom: 40, gap: 12 },
  header: { marginBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: theme.textPrimary },
  headerSub: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  card: {
    backgroundColor: theme.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: theme.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatarWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: theme.elevated, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: theme.accent,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: theme.accent },
  studentName: { fontSize: 15, fontWeight: '700', color: theme.textPrimary },
  studentEmail: { fontSize: 12, color: theme.textMuted, marginTop: 1 },
  badge: {
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  divider: { height: 1, backgroundColor: theme.border, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  detailIcon: { fontSize: 14 },
  detailText: { fontSize: 13, color: theme.textSecondary },
  completeBtn: {
    marginTop: 12, backgroundColor: theme.sage + '20', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: theme.sage,
  },
  completeBtnText: { color: theme.sage, fontWeight: '700', fontSize: 13 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: theme.textMuted, fontWeight: '600' },
});
