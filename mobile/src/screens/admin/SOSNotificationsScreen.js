import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

export default function SOSNotificationsScreen() {
  const { theme } = useTheme();
  const { admin, superAdmin } = useAuth();
  const s = styles(theme);

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'resolved'

  const fetchAlerts = async () => {
    try {
      let res;
      if (superAdmin) {
        res = await api.get('/superadmin/all-sos');
      } else {
        res = await api.get(`/get-all-sos/${admin?.adminID}`);
      }
      setAlerts(res.data || []);
    } catch (err) {
      console.log(err);
      setAlerts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, [admin, superAdmin]);

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      await api.patch(`/sos/resolve/${id}`);
      setAlerts(prev =>
        prev.map(a => a._id === id ? { ...a, resolved: true, resolvedAt: new Date().toISOString() } : a)
      );
      Toast.show({ type: 'success', text1: 'SOS marked as resolved' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to resolve SOS' });
    } finally {
      setResolvingId(null);
    }
  };

  const filtered = alerts.filter(a => {
    if (filter === 'active') return !a.resolved;
    if (filter === 'resolved') return a.resolved;
    return true;
  });

  const activeCount = alerts.filter(a => !a.resolved).length;
  const resolvedCount = alerts.filter(a => a.resolved).length;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fb7185" />
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.bg }}
      data={filtered}
      keyExtractor={(item) => item._id || Math.random().toString()}
      contentContainerStyle={s.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchAlerts(); }}
          tintColor="#fb7185"
        />
      }
      ListHeaderComponent={
        <>
          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.headerTitle}>SOS Alerts</Text>
              <Text style={s.headerSub}>{alerts.length} total · {activeCount} active · {resolvedCount} resolved</Text>
            </View>
            <View style={s.headerBadge}>
              {activeCount > 0
                ? <Text style={s.headerBadgeText}>{activeCount} Active</Text>
                : <Text style={[s.headerBadgeText, { color: theme.sage }]}>All Clear</Text>}
            </View>
          </View>

          {/* Filter tabs */}
          <View style={s.filterRow}>
            {[
              { key: 'all', label: `All (${alerts.length})` },
              { key: 'active', label: `Active (${activeCount})` },
              { key: 'resolved', label: `Resolved (${resolvedCount})` },
            ].map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[s.filterTab, filter === tab.key && s.filterTabActive]}
                onPress={() => setFilter(tab.key)}
              >
                <Text style={[s.filterTabText, filter === tab.key && s.filterTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      }
      renderItem={({ item }) => (
        <View style={[s.alertCard, item.resolved && s.alertCardResolved]}>
          {/* Card header */}
          <View style={s.alertHeader}>
            <View style={s.alertUserRow}>
              <View style={[s.alertAvatar, { backgroundColor: item.resolved ? theme.sage + '25' : '#fb718525' }]}>
                <Text style={{ fontSize: 16 }}>{item.resolved ? '✅' : '🆘'}</Text>
              </View>
              <View>
                <Text style={[s.alertUser, { color: item.resolved ? theme.sage : '#fb7185' }]}>
                  {item.userName || 'Student'}
                </Text>
                {item.email && <Text style={s.alertEmail}>{item.email}</Text>}
              </View>
            </View>
            <View style={[s.statusBadge, item.resolved ? s.badgeResolved : s.badgeActive]}>
              <Text style={[s.statusBadgeText, { color: item.resolved ? theme.sage : '#fb7185' }]}>
                {item.resolved ? 'Resolved' : 'Active'}
              </Text>
            </View>
          </View>

          {/* Message */}
          <View style={[s.msgBox, { borderLeftColor: item.resolved ? theme.sage : '#fb7185' }]}>
            <Text style={s.alertMsg}>{item.message || 'I need help urgently!'}</Text>
          </View>

          {/* Extra info */}
          <View style={s.infoRow}>
            {item.rollNumber && item.rollNumber !== 'NA' && (
              <View style={s.infoPill}>
                <Text style={s.infoPillText}>Roll: {item.rollNumber}</Text>
              </View>
            )}
            {item.phoneNumber && item.phoneNumber !== 'NA' && (
              <View style={s.infoPill}>
                <Text style={s.infoPillText}>📞 {item.phoneNumber}</Text>
              </View>
            )}
          </View>

          {/* Timestamps */}
          <View style={s.timeRow}>
            <Text style={s.alertTime}>
              Sent: {item.createdAt
                ? new Date(item.createdAt).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : 'Unknown'}
            </Text>
            {item.resolved && item.resolvedAt && (
              <Text style={[s.alertTime, { color: theme.sage }]}>
                Resolved: {new Date(item.resolvedAt).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>

          {/* Mark as Done button — only for active alerts */}
          {!item.resolved && (
            <TouchableOpacity
              style={s.resolveBtn}
              onPress={() => handleResolve(item._id)}
              disabled={resolvingId === item._id}
              activeOpacity={0.8}
            >
              {resolvingId === item._id
                ? <ActivityIndicator color="#fff" size="small" />
                : (
                  <>
                    <Text style={s.resolveBtnIcon}>✓</Text>
                    <Text style={s.resolveBtnText}>Mark as Done</Text>
                  </>
                )}
            </TouchableOpacity>
          )}
        </View>
      )}
      ListEmptyComponent={
        <View style={s.empty}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>
            {filter === 'resolved' ? '📋' : '✅'}
          </Text>
          <Text style={s.emptyText}>
            {filter === 'active' ? 'No active SOS alerts' :
             filter === 'resolved' ? 'No resolved alerts yet' :
             'No SOS alerts'}
          </Text>
        </View>
      }
    />
  );
}

const styles = (theme) => StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 10 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(251,113,133,0.07)',
    borderRadius: 18, padding: 18, marginBottom: 10,
    borderWidth: 1, borderColor: '#fb718540',
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fb7185', marginBottom: 4 },
  headerSub: { fontSize: 13, color: theme.textMuted },
  headerBadge: {
    backgroundColor: 'rgba(251,113,133,0.15)', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#fb718560',
  },
  headerBadgeText: { fontSize: 12, fontWeight: '700', color: '#fb7185' },

  // Filter tabs
  filterRow: {
    flexDirection: 'row', gap: 8, marginBottom: 10,
  },
  filterTab: {
    flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center',
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border,
  },
  filterTabActive: { backgroundColor: '#fb718520', borderColor: '#fb7185' },
  filterTabText: { fontSize: 12, fontWeight: '600', color: theme.textMuted },
  filterTabTextActive: { color: '#fb7185', fontWeight: '700' },

  // Alert card
  alertCard: {
    backgroundColor: theme.card, borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: '#fb718560', borderLeftWidth: 4, borderLeftColor: '#fb7185',
  },
  alertCardResolved: {
    borderColor: theme.border, borderLeftColor: theme.sage, opacity: 0.85,
  },

  // Card header
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  alertUserRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  alertAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  alertUser: { fontSize: 15, fontWeight: '700' },
  alertEmail: { fontSize: 12, color: theme.textMuted, marginTop: 1 },

  // Status badge
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  badgeActive: { backgroundColor: 'rgba(251,113,133,0.12)', borderColor: '#fb718570' },
  badgeResolved: { backgroundColor: 'rgba(76,175,138,0.12)', borderColor: `${theme.sage}70` },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },

  // Message box
  msgBox: { borderLeftWidth: 3, paddingLeft: 12, marginBottom: 10 },
  alertMsg: { fontSize: 14, color: theme.textPrimary, lineHeight: 20 },

  // Info pills
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  infoPill: {
    backgroundColor: theme.elevated, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: theme.border,
  },
  infoPillText: { fontSize: 11, color: theme.textSecondary, fontWeight: '600' },

  // Times
  timeRow: { gap: 2, marginBottom: 12 },
  alertTime: { fontSize: 11, color: theme.textMuted },

  // Resolve button
  resolveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: theme.sage, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 16,
  },
  resolveBtnIcon: { fontSize: 16, color: '#fff', fontWeight: '800' },
  resolveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Empty state
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: theme.textMuted, fontWeight: '600' },
});
