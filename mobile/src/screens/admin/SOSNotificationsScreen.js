import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

export default function SOSNotificationsScreen() {
  const { theme } = useTheme();
  const { admin, superAdmin } = useAuth();
  const s = styles(theme);

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, [admin, superAdmin]);

  if (loading) {
    return (
      <View style={[{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#fb7185" />
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.bg }}
      data={alerts}
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
        <View style={s.header}>
          <Text style={s.headerTitle}>🆘 SOS Alerts</Text>
          <Text style={s.headerSub}>{alerts.length} total alerts received</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[s.alertCard, item.resolved && s.alertResolved]}>
          <View style={s.alertHeader}>
            <Text style={s.alertUser}>{item.userName || 'Student'}</Text>
            <View style={[s.alertBadge, item.resolved ? s.resolvedBadge : s.activeBadge]}>
              <Text style={[s.alertBadgeText, item.resolved ? s.resolvedBadgeText : s.activeBadgeText]}>
                {item.resolved ? 'Resolved' : 'Active'}
              </Text>
            </View>
          </View>
          <Text style={s.alertMsg}>{item.message || 'I need help urgently!'}</Text>
          <Text style={s.alertTime}>
            {new Date(item.createdAt).toLocaleString('en', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </Text>
        </View>
      )}
      ListEmptyComponent={
        <View style={s.empty}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>✅</Text>
          <Text style={s.emptyText}>No SOS alerts</Text>
        </View>
      }
    />
  );
}

const styles = (theme) => StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 10 },
  header: {
    backgroundColor: theme.card, borderRadius: 18, padding: 20, marginBottom: 6,
    borderWidth: 1, borderColor: '#fb7185',
    backgroundColor: 'rgba(251,113,133,0.06)',
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fb7185', marginBottom: 4 },
  headerSub: { fontSize: 13, color: theme.textMuted },
  alertCard: {
    backgroundColor: theme.card, borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: '#fb7185',
    borderLeftWidth: 4,
  },
  alertResolved: { borderColor: theme.border, borderLeftColor: theme.success, opacity: 0.7 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  alertUser: { fontSize: 15, fontWeight: '700', color: '#fb7185' },
  alertBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1 },
  activeBadge: { backgroundColor: 'rgba(251,113,133,0.1)', borderColor: '#fb7185' },
  resolvedBadge: { backgroundColor: 'rgba(76,175,138,0.1)', borderColor: theme.success },
  alertBadgeText: { fontSize: 11, fontWeight: '700' },
  activeBadgeText: { color: '#fb7185' },
  resolvedBadgeText: { color: theme.success },
  alertMsg: { fontSize: 14, color: theme.textPrimary, marginBottom: 6, lineHeight: 20 },
  alertTime: { fontSize: 11, color: theme.textMuted },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: theme.textMuted, fontWeight: '600' },
});
