import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import Toast from 'react-native-toast-message';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function recipientLabel(type) {
  switch (type) {
    case 'all_users':      return 'All Students';
    case 'all_admins':     return 'All Admins';
    case 'broadcast_all':  return 'Everyone';
    case 'admin_students': return 'Your Students';
    case 'individual':     return 'Direct';
    default:               return type;
  }
}

function borderColor(type, theme) {
  switch (type) {
    case 'all_admins':     return theme.teal;
    case 'broadcast_all':  return theme.amber;
    case 'admin_students': return theme.sage;
    case 'individual':     return theme.accent;
    default:               return theme.accent;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminNotificationsScreen() {
  const { theme } = useTheme();
  const { admin } = useAuth();
  const s = styles(theme);

  const adminId   = admin?.adminID || admin?._id || admin?.id;
  const adminName = admin?.email || admin?.name || 'Admin';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  // ── Compose modal state ────────────────────────────────────────────────────
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle]               = useState('');
  const [message, setMessage]           = useState('');
  const [recipientType, setRecipientType] = useState('admin_students'); // only option for admin
  const [sending, setSending]           = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAnnouncements = useCallback(async () => {
    if (!adminId) return;
    try {
      const res = await api.get(`/announcements/admin/${adminId}`);
      const list = res.data?.announcements || [];
      setAnnouncements(list);

      // Mark unread as read in the background
      list
        .filter((a) => !a.isRead)
        .forEach((a) => {
          api.patch(`/announcements/${a._id}/read/${adminId}`).catch(() => {});
        });
    } catch (err) {
      console.log('AdminNotifications fetch error:', err?.message);
    }
  }, [adminId]);

  useEffect(() => {
    setLoading(true);
    fetchAnnouncements().finally(() => setLoading(false));
  }, [fetchAnnouncements]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
  }, [fetchAnnouncements]);

  // ── Send announcement ──────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'Title is required.' });
      return;
    }
    if (!message.trim()) {
      Toast.show({ type: 'error', text1: 'Message is required.' });
      return;
    }

    setSending(true);
    try {
      await api.post('/announcements', {
        title:         title.trim(),
        message:       message.trim(),
        sentByRole:    'admin',
        sentById:      adminId,
        sentByName:    adminName,
        recipientType: 'admin_students',
      });

      Toast.show({ type: 'success', text1: 'Announcement sent!', text2: 'Your students have been notified.' });
      setModalVisible(false);
      setTitle('');
      setMessage('');
      fetchAnnouncements();
    } catch (err) {
      console.log('Send announcement error:', err?.message);
      Toast.show({ type: 'error', text1: 'Failed to send', text2: err?.response?.data?.message || 'Please try again.' });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      setModalVisible(false);
      setTitle('');
      setMessage('');
    }
  };

  // ── Render card ────────────────────────────────────────────────────────────
  const renderItem = ({ item }) => {
    const border  = borderColor(item.recipientType, theme);
    const isUnread = !item.isRead;

    return (
      <View style={[s.card, { borderLeftColor: border }, isUnread && s.cardUnread]}>
        {isUnread && <View style={[s.unreadDot, { backgroundColor: border }]} />}

        <View style={s.cardHeader}>
          <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={[s.typeBadge, { backgroundColor: border + '22' }]}>
            <Text style={[s.typeLabel, { color: border }]}>
              {recipientLabel(item.recipientType)}
            </Text>
          </View>
        </View>

        <Text style={s.cardMessage}>{item.message}</Text>

        <View style={s.cardFooter}>
          <Text style={s.footerSender}>
            From: {item.sentByName || item.sentByRole || 'Admin'}
          </Text>
          <Text style={s.footerDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  const EmptyState = () => (
    <View style={s.emptyContainer}>
      <Text style={s.emptyIcon}>📭</Text>
      <Text style={s.emptyTitle}>No announcements yet</Text>
      <Text style={s.emptySubtitle}>
        Tap the button below to send an announcement to your students.
      </Text>
    </View>
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={s.loadingText}>Loading announcements...</Text>
      </View>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Announcements</Text>
        {announcements.length > 0 && (
          <View style={s.countBadge}>
            <Text style={s.countText}>{announcements.length}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={announcements}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={announcements.length === 0 ? s.listEmpty : s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={s.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Compose Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={handleClose}
      >
        <Pressable style={s.modalOverlay} onPress={handleClose}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={s.modalKAV}
          >
            <Pressable style={s.modalSheet} onPress={() => {}}>
              {/* Modal header */}
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Send Announcement</Text>
                <TouchableOpacity onPress={handleClose} disabled={sending}>
                  <Text style={s.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Recipient chips (admin can only send to own students) */}
                <Text style={s.fieldLabel}>Recipients</Text>
                <View style={s.chipRow}>
                  <View style={[s.chip, s.chipActive]}>
                    <Text style={s.chipTextActive}>All My Students</Text>
                  </View>
                </View>

                {/* Title */}
                <Text style={s.fieldLabel}>Title</Text>
                <TextInput
                  style={s.textInput}
                  placeholder="Announcement title"
                  placeholderTextColor={theme.textMuted}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={120}
                  editable={!sending}
                />

                {/* Message */}
                <Text style={s.fieldLabel}>Message</Text>
                <TextInput
                  style={[s.textInput, s.textArea]}
                  placeholder="Write your message here..."
                  placeholderTextColor={theme.textMuted}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  editable={!sending}
                />

                {/* Send button */}
                <TouchableOpacity
                  style={[s.sendBtn, sending && s.sendBtnDisabled]}
                  onPress={handleSend}
                  disabled={sending}
                  activeOpacity={0.85}
                >
                  {sending ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={s.sendBtnText}>Send to My Students</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bg,
    },

    // ── Header ──
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 56,
      paddingBottom: 16,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.textPrimary,
      flex: 1,
    },
    countBadge: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    countText: {
      color: theme.white,
      fontSize: 13,
      fontWeight: '600',
    },

    // ── List ──
    list: {
      padding: 16,
      paddingBottom: 100,
    },
    listEmpty: {
      flex: 1,
    },

    // ── Card ──
    card: {
      backgroundColor: theme.card,
      borderRadius: 14,
      borderLeftWidth: 4,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
      position: 'relative',
    },
    cardUnread: {
      backgroundColor: theme.elevated,
    },
    unreadDot: {
      position: 'absolute',
      top: 14,
      right: 14,
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
      gap: 8,
    },
    cardTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '700',
      color: theme.textPrimary,
      lineHeight: 22,
    },
    typeBadge: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
      alignSelf: 'flex-start',
    },
    typeLabel: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    cardMessage: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 21,
      marginBottom: 12,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: 10,
    },
    footerSender: {
      fontSize: 12,
      color: theme.textMuted,
      fontWeight: '500',
    },
    footerDate: {
      fontSize: 12,
      color: theme.textMuted,
    },

    // ── Empty ──
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
      paddingTop: 100,
    },
    emptyIcon: {
      fontSize: 56,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.textMuted,
      textAlign: 'center',
      lineHeight: 20,
    },

    // ── Loading ──
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.bg,
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      color: theme.textMuted,
    },

    // ── FAB ──
    fab: {
      position: 'absolute',
      bottom: 28,
      right: 24,
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: '#3ecfbe',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#3ecfbe',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.45,
      shadowRadius: 10,
      elevation: 8,
    },
    fabIcon: {
      fontSize: 30,
      color: '#fff',
      lineHeight: 34,
      fontWeight: '300',
    },

    // ── Modal ──
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    },
    modalKAV: {
      width: '100%',
    },
    modalSheet: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 36,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 19,
      fontWeight: '700',
      color: theme.textPrimary,
      flex: 1,
    },
    modalClose: {
      fontSize: 20,
      color: theme.textMuted,
      paddingHorizontal: 4,
    },

    // ── Form ──
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: 8,
      marginTop: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 18,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: theme.border,
      backgroundColor: theme.card,
    },
    chipActive: {
      borderColor: '#3ecfbe',
      backgroundColor: '#3ecfbe22',
    },
    chipText: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.textSecondary,
    },
    chipTextActive: {
      fontSize: 13,
      fontWeight: '600',
      color: '#3ecfbe',
    },
    textInput: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: theme.textPrimary,
      marginBottom: 16,
    },
    textArea: {
      minHeight: 110,
      paddingTop: 12,
    },
    sendBtn: {
      backgroundColor: '#3ecfbe',
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 4,
      shadowColor: '#3ecfbe',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 5,
    },
    sendBtnDisabled: {
      opacity: 0.6,
    },
    sendBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
  });
