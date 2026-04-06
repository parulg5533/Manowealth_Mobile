import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

export default function UserDataScreen({ navigation }) {
  const { theme } = useTheme();
  const { admin, superAdmin } = useAuth();
  const s = styles(theme);

  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      let res;
      if (superAdmin) {
        res = await api.get('/getAllUsers');
      } else {
        res = await api.get(`/user-admin-data/${admin?.adminID}`);
      }
      setUsers(res.data || []);
      setFiltered(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [admin, superAdmin]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(users);
    } else {
      setFiltered(users.filter(u =>
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      ));
    }
  }, [search, users]);

  const getScoreColor = (score) => {
    if (score == null) return theme.textMuted;
    if (score >= 70) return theme.sage;
    if (score >= 40) return theme.amber;
    return theme.danger;
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={s.userCard}
      onPress={() => navigation.navigate('UserReport', { userId: item._id, userName: item.username })}
      activeOpacity={0.8}
    >
      <View style={s.userAvatar}>
        <Text style={s.userAvatarText}>{item.username?.[0]?.toUpperCase() || 'U'}</Text>
      </View>
      <View style={s.userInfo}>
        <Text style={s.userName}>{item.username}</Text>
        <Text style={s.userEmail}>{item.email}</Text>
        <View style={s.tagRow}>
          {item.degree && <View style={s.tag}><Text style={s.tagText}>{item.degree}</Text></View>}
          {item.department && <View style={s.tag}><Text style={s.tagText}>{item.department?.split(' ')[0]}</Text></View>}
        </View>
      </View>
      {item.score != null && (
        <View style={s.scoreWrap}>
          <Text style={[s.scoreNum, { color: getScoreColor(item.score) }]}>
            {Math.round(item.score)}
          </Text>
          <Text style={s.scoreLabel}>score</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[{ flex: 1, backgroundColor: theme.bg }, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.success} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={s.searchWrap}>
        <TextInput
          style={s.searchInput}
          placeholder="Search students..."
          placeholderTextColor={theme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        <Text style={s.countText}>{filtered.length} students</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id || item.email}
        renderItem={renderUser}
        contentContainerStyle={s.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchUsers(); }}
            tintColor={theme.success}
          />
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>👥</Text>
            <Text style={s.emptyText}>No students found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 16, backgroundColor: theme.surface,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  searchInput: {
    flex: 1, backgroundColor: theme.elevated, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15,
    color: theme.textPrimary, borderWidth: 1, borderColor: theme.border,
  },
  countText: { fontSize: 13, color: theme.textMuted, fontWeight: '600', minWidth: 70, textAlign: 'right' },
  listContent: { padding: 14, gap: 10, paddingBottom: 32 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: theme.card, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: theme.border,
  },
  userAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: theme.elevated, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: theme.success,
  },
  userAvatarText: { fontSize: 18, fontWeight: '800', color: theme.success },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', color: theme.textPrimary, marginBottom: 2 },
  userEmail: { fontSize: 12, color: theme.textMuted, marginBottom: 4 },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: {
    backgroundColor: theme.elevated, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  tagText: { fontSize: 10, color: theme.textSecondary, fontWeight: '500' },
  scoreWrap: { alignItems: 'center' },
  scoreNum: { fontSize: 22, fontWeight: '900' },
  scoreLabel: { fontSize: 10, color: theme.textMuted },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: theme.textMuted, fontWeight: '600' },
});
