import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

const DEGREE_OPTIONS = ['B.Tech', 'M.Tech', 'M.Sc', 'PhD', 'MBA', 'Other'];
const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const SEMESTER_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const DEPARTMENT_OPTIONS = [
  'Computer Science & Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Humanities & Social Sciences',
  'Other',
];

export default function DemographicFormScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();

  // If user already accepted TNC, skip to UserTabs
  useEffect(() => {
    if (!user?.userID) return;
    api.get(`/get-user-info/${user.userID}`)
      .then(res => {
        if (res.data?.has_accepted_tnc) {
          navigation.replace('UserTabs');
        }
      })
      .catch(() => {});
  }, [user]);
  const s = styles(theme);

  const [degree, setDegree] = useState(DEGREE_OPTIONS[0]);
  const [department, setDepartment] = useState(DEPARTMENT_OPTIONS[0]);
  const [semester, setSemester] = useState(SEMESTER_OPTIONS[0]);
  const [gender, setGender] = useState(GENDER_OPTIONS[0]);
  const [age, setAge] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!agreed) {
      Toast.show({ type: 'error', text1: 'Please accept the terms and conditions' });
      return;
    }
    if (!age) {
      Toast.show({ type: 'error', text1: 'Please enter your age' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/update-profile', {
        user: user?.userID,
        firstname: user?.username,
        lastname: '',
        degree,
        dept: department,
        semester,
        gender,
        contactNumber: '',
      });
      await api.post('/update-tnc', { userId: user?.userID });
      Toast.show({ type: 'success', text1: 'Profile updated!' });
      navigation.replace('UserTabs');

    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to save profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.heroBanner}>
        <View style={s.badge}><Text style={s.badgeText}>STEP 1 OF 1</Text></View>
        <Text style={s.heroTitle}>Demographic{'\n'}Information</Text>
        <Text style={s.heroSub}>
          Help us personalise your wellness journey by sharing a few details.
        </Text>
      </View>

      <View style={s.formCard}>
        <Text style={s.sectionTitle}>Personal Details</Text>

        <View style={s.fieldWrap}>
          <Text style={s.label}>Degree Program</Text>
          <View style={s.pickerWrap}>
            <Picker
              selectedValue={degree}
              onValueChange={setDegree}
              style={s.picker}
              dropdownIconColor={theme.textSecondary}
            >
              {DEGREE_OPTIONS.map(d => <Picker.Item key={d} label={d} value={d} color={Platform.OS === 'android' ? theme.textPrimary : undefined} />)}
            </Picker>
          </View>
        </View>

        <View style={s.fieldWrap}>
          <Text style={s.label}>Department</Text>
          <View style={s.pickerWrap}>
            <Picker
              selectedValue={department}
              onValueChange={setDepartment}
              style={s.picker}
              dropdownIconColor={theme.textSecondary}
            >
              {DEPARTMENT_OPTIONS.map(d => <Picker.Item key={d} label={d} value={d} color={Platform.OS === 'android' ? theme.textPrimary : undefined} />)}
            </Picker>
          </View>
        </View>

        <View style={s.fieldWrap}>
          <Text style={s.label}>Semester</Text>
          <View style={s.pickerWrap}>
            <Picker
              selectedValue={semester}
              onValueChange={setSemester}
              style={s.picker}
              dropdownIconColor={theme.textSecondary}
            >
              {SEMESTER_OPTIONS.map(d => <Picker.Item key={d} label={`Semester ${d}`} value={d} color={Platform.OS === 'android' ? theme.textPrimary : undefined} />)}
            </Picker>
          </View>
        </View>

        <View style={s.fieldWrap}>
          <Text style={s.label}>Gender</Text>
          <View style={s.pickerWrap}>
            <Picker
              selectedValue={gender}
              onValueChange={setGender}
              style={s.picker}
              dropdownIconColor={theme.textSecondary}
            >
              {GENDER_OPTIONS.map(d => <Picker.Item key={d} label={d} value={d} color={Platform.OS === 'android' ? theme.textPrimary : undefined} />)}
            </Picker>
          </View>
        </View>

        <View style={s.fieldWrap}>
          <Text style={s.label}>Age</Text>
          <TextInput
            style={s.input}
            placeholder="Your age"
            placeholderTextColor={theme.textMuted}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
          />
        </View>

        <TouchableOpacity
          style={s.checkRow}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.7}
        >
          <View style={[s.checkbox, agreed && s.checkboxOn]}>
            {agreed && <Text style={s.checkmark}>✓</Text>}
          </View>
          <Text style={s.checkLabel}>
            I agree to the <Text style={s.link}>terms and conditions</Text> and understand my data will be used for wellness assessment purposes only.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.btn} onPress={handleSubmit} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>Continue to Dashboard →</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 16, paddingBottom: 40 },
  heroBanner: {
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 28,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(88,166,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(88,166,255,0.3)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
  },
  badgeText: { color: theme.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: theme.textPrimary, lineHeight: 34, marginBottom: 10 },
  heroSub: { fontSize: 15, color: theme.textSecondary, lineHeight: 22 },
  formCard: {
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.textPrimary, marginBottom: 16 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: theme.elevated,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: theme.textPrimary,
  },
  pickerWrap: {
    backgroundColor: theme.elevated,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: { color: theme.textPrimary, height: 50 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 12 },
  checkbox: {
    width: 24, height: 24,
    borderWidth: 2,
    borderColor: theme.border,
    borderRadius: 6,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: theme.accent, borderColor: theme.accent },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  checkLabel: { flex: 1, fontSize: 14, color: theme.textSecondary, lineHeight: 20 },
  link: { color: theme.accent },
  btn: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
