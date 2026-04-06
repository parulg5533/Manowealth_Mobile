import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert, Pressable,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

export default function SuperAdminDashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const { superAdmin, logout } = useAuth();
  const s = styles(theme);

  const [stats, setStats] = useState({ users: 0, admins: 0, surveys: 0, sos: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [usersRes, adminsRes] = await Promise.all([
        api.get('/getAllUsers'),
        api.get('/getAllAdmins'),
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
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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
    { icon: '👥', label: 'All Students', color: theme.accent, screen: 'AllUsers' },
    { icon: '👤', label: 'All Admins', color: theme.success, screen: 'AllAdmins' },
    { icon: '➕', label: 'Add Admin', color: theme.sage, screen: 'AddAdmin' },
    { icon: '🆘', label: 'SOS Logs', color: '#fb7185', screen: 'AllSOSLogs' },
    { icon: '📅', label: 'Appointments', color: '#818cf8', screen: 'AllAppointments' },
    { icon: '🤝', label: 'Help Friend', color: theme.teal, screen: 'HelpAFriendEntries' },
  ];

  return (
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
            onPress={() => navigation.navigate(item.screen)}
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
});
