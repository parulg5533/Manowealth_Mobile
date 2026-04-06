import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

export default function AdminDashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const { admin, logout } = useAuth();
  const s = styles(theme);

  const [users, setUsers] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [usersRes, sosRes] = await Promise.all([
        api.get(`/user-admin-data/${admin?.adminID}`),
        api.get(`/get-all-sos/${admin?.adminID}`),
      ]);
      setUsers(usersRes.data || []);
      setSosAlerts(sosRes.data?.filter(s => !s.resolved) || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { if (admin?.adminID) fetchData(); }, [admin]);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.success} />
      </View>
    );
  }

  return (
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
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
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
          <TouchableOpacity
            style={s.viewAllBtn}
            onPress={() => navigation.navigate('SOSNotifications')}
          >
            <Text style={s.viewAllText}>View All SOS Alerts</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Quick Actions</Text>
        <View style={s.actionsGrid}>
          {[
            { icon: '👥', label: 'My Users', color: theme.success, screen: 'UserData' },
            { icon: '🆘', label: 'SOS Alerts', color: '#fb7185', screen: 'SOSNotifications' },
            { icon: '📊', label: 'Reports', color: '#818cf8', screen: 'UserData' },
            { icon: '👤', label: 'Unassigned', color: theme.amber, screen: 'UnassignedUsers' },
          ].map(item => (
            <TouchableOpacity
              key={item.label}
              style={s.actionBtn}
              onPress={() => navigation.navigate(item.screen)}
            >
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
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: theme.textPrimary },
  adminEmail: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  logoutBtn: {
    backgroundColor: 'rgba(224,124,124,0.1)', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: theme.danger,
  },
  logoutText: { fontSize: 13, color: theme.danger, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: theme.card, borderRadius: 16, padding: 16,
    borderWidth: 1.5, alignItems: 'center',
  },
  statNum: { fontSize: 32, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 12, color: theme.textMuted, fontWeight: '600' },
  card: {
    backgroundColor: theme.card, borderRadius: 18, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: theme.border,
  },
  sosCard: {
    borderColor: '#fb7185',
    backgroundColor: 'rgba(251,113,133,0.05)',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary },
  seeAll: { fontSize: 13, color: theme.accent },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: {
    width: '47%', backgroundColor: theme.elevated, borderRadius: 14, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: theme.border,
  },
  actionIcon: { fontSize: 24, marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '700' },
  sosRow: {
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  sosUser: { fontSize: 14, fontWeight: '700', color: '#fb7185', marginBottom: 2 },
  sosTime: { fontSize: 11, color: theme.textMuted, marginBottom: 2 },
  sosMsg: { fontSize: 13, color: theme.textSecondary },
  viewAllBtn: {
    backgroundColor: 'rgba(251,113,133,0.1)', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center', marginTop: 10,
    borderWidth: 1, borderColor: '#fb7185',
  },
  viewAllText: { color: '#fb7185', fontWeight: '700', fontSize: 13 },
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  userAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: theme.elevated, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: theme.border,
  },
  userAvatarText: { fontSize: 16, fontWeight: '700', color: theme.success },
  userName: { fontSize: 14, fontWeight: '700', color: theme.textPrimary },
  userEmail: { fontSize: 12, color: theme.textMuted },
  scoreBadge: {
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, backgroundColor: 'transparent',
  },
  scoreText: { fontSize: 12, fontWeight: '800' },
});
