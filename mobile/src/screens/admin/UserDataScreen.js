import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Modal,
  ScrollView, Pressable,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

export default function UserDataScreen({ navigation }) {
  const { theme } = useTheme();
  const { admin, superAdmin } = useAuth();
  const s = styles(theme);

  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Assign modal state
  const [admins, setAdmins] = useState([]);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assigning, setAssigning] = useState(false);

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

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/getAllAdmins');
      setAdmins(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => { fetchUsers(); }, [admin, superAdmin]);

  useEffect(() => {
    if (superAdmin) fetchAdmins();
  }, [superAdmin]);

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

  const openAssignModal = (student) => {
    setSelectedStudent(student);
    setAssignModalVisible(true);
  };

  const handleAssign = async (adminId) => {
    setAssigning(true);
    try {
      await api.post('/assign-admin', { userId: selectedStudent._id, adminId });
      Toast.show({ type: 'success', text1: `${selectedStudent.username} assigned successfully` });
      setAssignModalVisible(false);
      fetchUsers();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to assign student' });
    } finally {
      setAssigning(false);
    }
  };

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
      onLongPress={() => superAdmin && openAssignModal(item)}
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
          {superAdmin && (
            <View style={[s.tag, { borderColor: item.assigned_admin ? theme.sage : theme.amber, borderWidth: 1 }]}>
              <Text style={[s.tagText, { color: item.assigned_admin ? theme.sage : theme.amber }]}>
                {item.assigned_admin ? 'Assigned' : 'Unassigned'}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        {item.score != null && (
          <View style={s.scoreWrap}>
            <Text style={[s.scoreNum, { color: getScoreColor(item.score) }]}>
              {Math.round(item.score)}
            </Text>
            <Text style={s.scoreLabel}>score</Text>
          </View>
        )}
        {superAdmin && (
          <TouchableOpacity style={s.assignBtn} onPress={() => openAssignModal(item)}>
            <Text style={s.assignBtnText}>Assign</Text>
          </TouchableOpacity>
        )}
      </View>
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

      {/* Assign Admin Modal */}
      <Modal
        visible={assignModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <Pressable style={s.modalOverlay} onPress={() => setAssignModalVisible(false)}>
          <Pressable style={s.modalSheet} onPress={() => {}}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Assign Counselor</Text>
            <Text style={s.modalSub}>
              Student: <Text style={{ color: theme.accent }}>{selectedStudent?.username}</Text>
            </Text>

            {assigning ? (
              <ActivityIndicator size="large" color={theme.accent} style={{ marginVertical: 30 }} />
            ) : (
              <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
                {admins.length === 0 ? (
                  <Text style={s.noAdmins}>No admins available. Create an admin first.</Text>
                ) : (
                  admins.map((a) => (
                    <TouchableOpacity
                      key={a._id}
                      style={[
                        s.adminOption,
                        selectedStudent?.assigned_admin === a._id && s.adminOptionActive,
                      ]}
                      onPress={() => handleAssign(a._id)}
                    >
                      <View style={s.adminAvatar}>
                        <Text style={s.adminAvatarText}>{a.username?.[0]?.toUpperCase() || 'A'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.adminName}>{a.username}</Text>
                        <Text style={s.adminEmail}>{a.email}</Text>
                      </View>
                      {selectedStudent?.assigned_admin === a._id && (
                        <Text style={{ color: theme.sage, fontSize: 18 }}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}

            <TouchableOpacity style={s.cancelBtn} onPress={() => setAssignModalVisible(false)}>
              <Text style={s.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
  assignBtn: {
    backgroundColor: theme.accent + '20', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: theme.accent,
  },
  assignBtnText: { fontSize: 11, color: theme.accent, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: theme.textMuted, fontWeight: '600' },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: theme.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.textPrimary, marginBottom: 4 },
  modalSub: { fontSize: 13, color: theme.textMuted, marginBottom: 16 },
  adminOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 14, marginBottom: 8,
    backgroundColor: theme.elevated, borderWidth: 1, borderColor: theme.border,
  },
  adminOptionActive: { borderColor: theme.sage, backgroundColor: theme.sage + '15' },
  adminAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: theme.border,
  },
  adminAvatarText: { fontSize: 16, fontWeight: '700', color: theme.accent },
  adminName: { fontSize: 14, fontWeight: '700', color: theme.textPrimary },
  adminEmail: { fontSize: 12, color: theme.textMuted },
  noAdmins: { textAlign: 'center', color: theme.textMuted, marginVertical: 30, fontSize: 14 },
  cancelBtn: {
    marginTop: 16, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1, borderColor: theme.border, alignItems: 'center',
  },
  cancelBtnText: { color: theme.textSecondary, fontWeight: '600', fontSize: 15 },
});
