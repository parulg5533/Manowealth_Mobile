import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Home Screens
import MainScreen from '../screens/home/MainScreen';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import AdminLoginScreen from '../screens/auth/AdminLoginScreen';
import SuperAdminLoginScreen from '../screens/auth/SuperAdminLoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// User Screens
import DemographicFormScreen from '../screens/user/DemographicFormScreen';
import UserDashboardScreen from '../screens/user/UserDashboardScreen';
import ChatbotScreen from '../screens/user/ChatbotScreen';
import SurveyScreen from '../screens/user/SurveyScreen';
import SummaryScreen from '../screens/user/SummaryScreen';
import MoodTrackerScreen from '../screens/user/MoodTrackerScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import HelpAFriendScreen from '../screens/user/HelpAFriendScreen';
import AppointmentScreen from '../screens/user/AppointmentScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserDataScreen from '../screens/admin/UserDataScreen';
import UserReportScreen from '../screens/admin/UserReportScreen';
import SOSNotificationsScreen from '../screens/admin/SOSNotificationsScreen';
import AllAppointmentsScreen from '../screens/admin/AllAppointmentsScreen';

// Super Admin Screens
import SuperAdminDashboardScreen from '../screens/superadmin/SuperAdminDashboardScreen';
import AllAdminsScreen from '../screens/superadmin/AllAdminsScreen';
import AddAdminScreen from '../screens/superadmin/AddAdminScreen';

// Notification Screens
import UserNotificationsScreen from '../screens/notifications/UserNotificationsScreen';
import AdminNotificationsScreen from '../screens/notifications/AdminNotificationsScreen';
import SuperAdminNotificationsScreen from '../screens/notifications/SuperAdminNotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function UserTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ size }) => {
          const icons = { Dashboard: '🏠', Chatbot: '💬', MoodTracker: '😊', Profile: '👤' };
          return <Text style={{ fontSize: size - 4 }}>{icons[route.name] || '●'}</Text>;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={UserDashboardScreen} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} options={{ tabBarLabel: 'Survey' }} />
      <Tab.Screen name="MoodTracker" component={MoodTrackerScreen} options={{ tabBarLabel: 'Mood' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.success,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ size }) => {
          const icons = { AdminDashboard: '📊', UserData: '👥', SOSNotifications: '🆘' };
          return <Text style={{ fontSize: size - 4 }}>{icons[route.name] || '●'}</Text>;
        },
      })}
    >
      <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="UserData" component={UserDataScreen} options={{ tabBarLabel: 'Students' }} />
      <Tab.Screen name="SOSNotifications" component={SOSNotificationsScreen} options={{ tabBarLabel: 'SOS' }} />
    </Tab.Navigator>
  );
}

// Auth stack (no user logged in)
function AuthStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: theme.card },
      headerTintColor: theme.textPrimary,
      headerTitleStyle: { fontWeight: '700' },
      headerShadowVisible: false,
    }}>
      <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SuperAdminLogin" component={SuperAdminLoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot Password' }} />
      <Stack.Screen name="HelpAFriend" component={HelpAFriendScreen} options={{ title: 'Help a Friend' }} />
    </Stack.Navigator>
  );
}

// User stack
function UserStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: theme.card },
      headerTintColor: theme.textPrimary,
      headerTitleStyle: { fontWeight: '700' },
      headerShadowVisible: false,
      contentStyle: { backgroundColor: theme.bg },
    }}>
      <Stack.Screen name="DemographicForm" component={DemographicFormScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UserTabs" component={UserTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Survey" component={SurveyScreen} options={{ title: 'Wellness Survey' }} />
      <Stack.Screen name="Summary" component={SummaryScreen} options={{ title: 'My Results' }} />
      <Stack.Screen name="HelpAFriend" component={HelpAFriendScreen} options={{ title: 'Help a Friend' }} />
      <Stack.Screen name="Appointment" component={AppointmentScreen} options={{ title: 'Appointments' }} />
      <Stack.Screen name="Notifications" component={UserNotificationsScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
}

// Admin stack
function AdminStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: theme.card },
      headerTintColor: theme.textPrimary,
      headerTitleStyle: { fontWeight: '700' },
      headerShadowVisible: false,
      contentStyle: { backgroundColor: theme.bg },
    }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ headerShown: false }} />
      <Stack.Screen name="UserReport" component={UserReportScreen} options={({ route }) => ({ title: route.params?.userName || 'Student Report' })} />
      <Stack.Screen name="UnassignedUsers" component={UserDataScreen} options={{ title: 'Unassigned Students' }} />
      <Stack.Screen name="AllAppointments" component={AllAppointmentsScreen} options={{ title: 'Appointment Logs' }} />
      <Stack.Screen name="Notifications" component={AdminNotificationsScreen} options={{ title: 'Announcements' }} />
    </Stack.Navigator>
  );
}

// Super Admin stack
function SuperAdminStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: theme.card },
      headerTintColor: theme.textPrimary,
      headerTitleStyle: { fontWeight: '700' },
      headerShadowVisible: false,
      contentStyle: { backgroundColor: theme.bg },
    }}>
      <Stack.Screen name="SuperAdminDashboard" component={SuperAdminDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AllAdmins" component={AllAdminsScreen} options={{ title: 'All Admins' }} />
      <Stack.Screen name="AddAdmin" component={AddAdminScreen} options={{ title: 'Add Admin' }} />
      <Stack.Screen name="AllUsers" component={UserDataScreen} options={{ title: 'All Students' }} />
      <Stack.Screen name="AllSOSLogs" component={SOSNotificationsScreen} options={{ title: 'SOS Logs' }} />
      <Stack.Screen name="AllAppointments" component={AllAppointmentsScreen} options={{ title: 'Appointment Logs' }} />
      <Stack.Screen name="HelpAFriendEntries" component={HelpAFriendScreen} options={{ title: 'Help a Friend Entries' }} />
      <Stack.Screen name="UserReport" component={UserReportScreen} options={({ route }) => ({ title: route.params?.userName || 'Student Report' })} />
      <Stack.Screen name="Notifications" component={SuperAdminNotificationsScreen} options={{ title: 'Announcements' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, admin, superAdmin, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {superAdmin ? <SuperAdminStack /> :
       admin ? <AdminStack /> :
       user ? <UserStack /> :
       <AuthStack />}
    </NavigationContainer>
  );
}
