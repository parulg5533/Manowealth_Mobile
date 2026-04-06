import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Image, TextInput, Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

export default function ProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const s = styles(theme);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/get-user-info/${user?.userID}`);
      setProfile(res.data);
      setForm({
        username: res.data.username || '',
        degree: res.data.degree || '',
        department: res.data.department || '',
        semester: res.data.semester || '',
        gender: res.data.gender || '',
        age: res.data.age?.toString() || '',
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.userID) fetchProfile(); }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/edit-profile', {
        userId: user?.userID,
        ...form,
      });
      Toast.show({ type: 'success', text1: 'Profile updated!' });
      setEditing(false);
      fetchProfile();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permission to access gallery denied' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      const formData = new FormData();
      formData.append('image', {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
      formData.append('user', user?.userID);
      try {
        await api.post('/edit-profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        Toast.show({ type: 'success', text1: 'Profile picture updated!' });
        fetchProfile();
      } catch (err) {
        Toast.show({ type: 'error', text1: 'Failed to upload image' });
      }
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Avatar */}
      <View style={s.avatarSection}>
        <TouchableOpacity style={s.avatarRing} onPress={pickImage}>
          {profile?.profileImage
            ? <Image source={{ uri: profile.profileImage }} style={s.avatarImg} />
            : (
              <View style={s.avatarFallback}>
                <Text style={s.avatarInitial}>{user?.username?.[0]?.toUpperCase() || 'U'}</Text>
              </View>
            )}
          <View style={s.editBadge}><Text style={{ fontSize: 12 }}>✏️</Text></View>
        </TouchableOpacity>
        <Text style={s.profileName}>{profile?.username || user?.username}</Text>
        <Text style={s.profileEmail}>{user?.email}</Text>
        {profile?.score != null && (
          <View style={s.scoreBadge}>
            <Text style={s.scoreText}>Wellness Score: {Math.round(profile.score)}</Text>
          </View>
        )}
      </View>

      {/* Profile Details */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardTitle}>Profile Information</Text>
          <TouchableOpacity
            style={s.editBtn}
            onPress={() => editing ? handleSave() : setEditing(true)}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator size="small" color={theme.accent} />
              : <Text style={s.editBtnText}>{editing ? 'Save' : 'Edit'}</Text>}
          </TouchableOpacity>
        </View>

        {editing ? (
          <>
            {[
              { key: 'username', label: 'Username' },
              { key: 'age', label: 'Age', keyboardType: 'number-pad' },
            ].map(f => (
              <View key={f.key} style={s.fieldRow}>
                <Text style={s.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={s.fieldInput}
                  value={form[f.key]}
                  onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))}
                  keyboardType={f.keyboardType || 'default'}
                  placeholderTextColor={theme.textMuted}
                />
              </View>
            ))}
            {[
              { key: 'gender', label: 'Gender', options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'] },
              { key: 'degree', label: 'Degree', options: ['B.Tech', 'M.Tech', 'M.Sc', 'PhD', 'MBA', 'Other'] },
              { key: 'semester', label: 'Semester', options: ['1','2','3','4','5','6','7','8'] },
            ].map(f => (
              <View key={f.key} style={s.fieldRow}>
                <Text style={s.fieldLabel}>{f.label}</Text>
                <View style={s.pickerWrap}>
                  <Picker
                    selectedValue={form[f.key]}
                    onValueChange={v => setForm(p => ({ ...p, [f.key]: v }))}
                    style={s.picker}
                    dropdownIconColor={theme.textSecondary}
                  >
                    {f.options.map(o => (
                      <Picker.Item key={o} label={o} value={o} color={Platform.OS === 'android' ? theme.textPrimary : undefined} />
                    ))}
                  </Picker>
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            {[
              { label: 'Username', value: profile?.username },
              { label: 'Email', value: user?.email },
              { label: 'Gender', value: profile?.gender },
              { label: 'Age', value: profile?.age },
              { label: 'Degree', value: profile?.degree },
              { label: 'Department', value: profile?.department },
              { label: 'Semester', value: profile?.semester && `Semester ${profile.semester}` },
            ].filter(f => f.value).map(f => (
              <View key={f.label} style={s.infoRow}>
                <Text style={s.infoLabel}>{f.label}</Text>
                <Text style={s.infoValue}>{f.value}</Text>
              </View>
            ))}
          </>
        )}
      </View>

      {/* Survey Score Card */}
      {profile && (
        <View style={s.scoreCard}>
          <Text style={s.cardTitle}>Assessment Scores</Text>
          <View style={s.scoreGrid}>
            {[
              { label: 'WHO-5', value: profile.who5_score, color: theme.sage },
              { label: 'PHQ-9', value: profile.phq9_score, color: '#fb7185' },
              { label: 'GAD-7', value: profile.gad7_score, color: '#818cf8' },
              { label: 'Overall', value: profile.score, color: theme.accent },
            ].filter(s => s.value != null).map(item => (
              <View key={item.label} style={[s.scoreItem, { borderColor: item.color }]}>
                <Text style={[s.scoreVal, { color: item.color }]}>{Math.round(item.value)}</Text>
                <Text style={s.scoreItemLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={s.surveyBtn} onPress={() => navigation.navigate('Survey')}>
            <Text style={s.surveyBtnText}>Retake Survey</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 16, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarRing: {
    width: 100, height: 100,
    borderRadius: 50,
    backgroundColor: theme.accent,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  avatarImg: { width: 94, height: 94, borderRadius: 47 },
  avatarFallback: {
    width: 94, height: 94,
    borderRadius: 47,
    backgroundColor: theme.elevated,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontSize: 36, fontWeight: '800', color: theme.accent },
  editBadge: {
    position: 'absolute', bottom: 2, right: 2,
    backgroundColor: theme.card,
    borderRadius: 12, width: 24, height: 24,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: theme.border,
  },
  profileName: { fontSize: 22, fontWeight: '800', color: theme.textPrimary, marginBottom: 4 },
  profileEmail: { fontSize: 14, color: theme.textMuted, marginBottom: 8 },
  scoreBadge: {
    backgroundColor: 'rgba(110,203,138,0.15)',
    borderWidth: 1, borderColor: 'rgba(110,203,138,0.4)',
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5,
  },
  scoreText: { fontSize: 13, color: theme.sage, fontWeight: '700' },
  card: {
    backgroundColor: theme.card,
    borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: theme.border,
    marginBottom: 14,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary },
  editBtn: {
    backgroundColor: theme.elevated,
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: theme.border,
  },
  editBtnText: { fontSize: 13, color: theme.accent, fontWeight: '700' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  infoLabel: { fontSize: 14, color: theme.textMuted, fontWeight: '500' },
  infoValue: { fontSize: 14, color: theme.textPrimary, fontWeight: '600' },
  fieldRow: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, color: theme.textSecondary, fontWeight: '600', marginBottom: 6 },
  fieldInput: {
    backgroundColor: theme.elevated, borderWidth: 1, borderColor: theme.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, color: theme.textPrimary,
  },
  pickerWrap: { backgroundColor: theme.elevated, borderWidth: 1, borderColor: theme.border, borderRadius: 10, overflow: 'hidden' },
  picker: { color: theme.textPrimary, height: 48 },
  scoreCard: {
    backgroundColor: theme.card,
    borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: theme.border,
    marginBottom: 14,
  },
  scoreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 14 },
  scoreItem: {
    flex: 1, minWidth: '44%',
    backgroundColor: theme.elevated,
    borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1.5,
  },
  scoreVal: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
  scoreItemLabel: { fontSize: 12, color: theme.textMuted, fontWeight: '600' },
  surveyBtn: {
    backgroundColor: theme.accent, borderRadius: 10,
    paddingVertical: 11, alignItems: 'center',
  },
  surveyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  logoutBtn: {
    backgroundColor: 'rgba(224,124,124,0.1)',
    borderWidth: 1, borderColor: theme.danger,
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  logoutText: { color: theme.danger, fontSize: 16, fontWeight: '700' },
});
