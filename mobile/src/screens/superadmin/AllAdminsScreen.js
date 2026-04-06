import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, TextInput,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

export default function AllAdminsScreen({ navigation }) {
  const { theme } = useTheme();
  const s = styles(theme);

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/getAllAdmins');
      setAdmins(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleDelete = (adminId, adminName) => {
    Alert.alert(
      'Delete Admin',
      `Are you sure you want to delete ${adminName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/delete-admin/${adminId}`);
              Toast.show({ type: 'success', text1: 'Admin deleted' });
              fetchAdmins();
            } catch (err) {
              Toast.show({ type: 'error', text1: 'Failed to delete admin' });
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.success} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.bg }}
      data={admins}
      keyExtractor={(item) => item._id}
      contentContainerStyle={s.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchAdmins(); }}
          tintColor={theme.success}
        />
      }
      ListHeaderComponent={
        <View style={s.header}>
          <Text style={s.headerTitle}>All Admins</Text>
          <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('AddAdmin')}>
            <Text style={s.addBtnText}>+ Add Admin</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => (
        <View style={s.adminCard}>
          <View style={s.adminAvatar}>
            <Text style={s.avatarText}>{item.username?.[0]?.toUpperCase() || 'A'}</Text>
          </View>
          <View style={s.adminInfo}>
            <Text style={s.adminName}>{item.username}</Text>
            <Text style={s.adminEmail}>{item.email}</Text>
            <Text style={s.adminUsers}>{item.assigned_users?.length || 0} students assigned</Text>
          </View>
          <TouchableOpacity
            style={s.deleteBtn}
            onPress={() => handleDelete(item._id, item.username)}
          >
            <Text style={s.deleteBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={
        <View style={s.empty}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>👤</Text>
          <Text style={s.emptyText}>No admins found</Text>
        </View>
      }
    />
  );
}

const styles = (theme) => StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 10 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: theme.textPrimary },
  addBtn: {
    backgroundColor: theme.success, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  adminCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: theme.card, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: theme.border,
  },
  adminAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: theme.elevated, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: theme.success,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: theme.success },
  adminInfo: { flex: 1 },
  adminName: { fontSize: 15, fontWeight: '700', color: theme.textPrimary, marginBottom: 2 },
  adminEmail: { fontSize: 12, color: theme.textMuted, marginBottom: 2 },
  adminUsers: { fontSize: 12, color: theme.textSecondary },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(224,124,124,0.1)',
    borderWidth: 1, borderColor: theme.danger,
    alignItems: 'center', justifyContent: 'center',
  },
  deleteBtnText: { color: theme.danger, fontWeight: '800', fontSize: 14 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: theme.textMuted, fontWeight: '600' },
});
