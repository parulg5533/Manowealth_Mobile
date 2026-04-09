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

// ─── Constants ─────────────────────────────────────────────────────────────────

const RECIPIENT_TYPES = [
  { key: 'all_users',     label: 'All Students',      color: '#7c83e0' },
  { key: 'all_admins',    label: 'All Admins',         color: '#3ecfbe' },
  { key: 'broadcast_all', label: 'Everyone',           color: '#f0a96a' },
  { key: 'individual',    label: 'Specific User',      color: '#6ecb8a' },
];

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

function getRecipientMeta(key) {
  return RECIPIENT_TYPES.find((r) => r.key === key) || { label: key, color: '#7c83e0' };
}

function borderColor(type) {
  return getRecipientMeta(type).color;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SuperAdminNotificationsScreen() {
  const { theme } = useTheme();
  const { superAdmin } = useAuth();
  const s = styles(theme);

  const superAdminId   = superAdmin?._id || superAdmin?.id;
  const superAdminName = superAdmin?.email || superAdmin?.name || 'Super Admin';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  // ── Compose modal state ────────────────────────────────────────────────────
  const [modalVisible, setModalVisible]     = useState(false);
  const [title, setTitle]                   = useState('');
  const [message, setMessage]               = useState('');
  const [recipientType, setRecipientType]   = useState('all_users');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sending, setSending]               = useState(false);
  const [lookingUp, setLookingUp]           = useState(false);

  // ── Fetch all announcements ────────────────────────────────────────────────
  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await api.get('/announcements/all');
      setAnnouncements(res.data?.announcements || []);
    } catch (err) {
      console.log('SuperAdminNotifications fetch error:', err?.message);
    }
  }, []);

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
    if (recipientType === 'individual' && !recipientEmail.trim()) {
      Toast.show({ type: 'error', text1: 'Recipient email is required.' });
      return;
    }

    setSending(true);
    try {
      let recipientId = null;

      // Look up user by email for individual send
      if (recipientType === 'individual') {
        setLookingUp(true);
        try {
          const lookupRes = await api.post('/check-email', { email: recipientEmail.trim() });
          const foundUser = lookupRes.data?.user || lookupRes.data;
          if (!foundUser || (!foundUser._id && !foundUser.id)) {
            Toast.show({ type: 'error', text1: 'User not found', text2: 'No account with that email.' });
            setSending(false);
            setLookingUp(false);
            return;
          }
          recipientId = foundUser._id || foundUser.id;
        } catch (lookupErr) {
          Toast.show({
            type: 'error',
            text1: 'User lookup failed',
            text2: lookupErr?.response?.data?.message || 'Could not find that email.',
          });
          setSending(false);
          setLookingUp(false);
          return;
        } finally {
          setLookingUp(false);
        }
      }

      const payload = {
        title:         title.trim(),
        message:       message.trim(),
        sentByRole:    'superadmin',
        sentById:      superAdminId,
        sentByName:    superAdminName,
        recipientType,
      };

      if (recipientType === 'individual' && recipientId) {
        payload.recipientId = recipientId;
      }

      await api.post('/announcements', payload);

      Toast.show({
        type: 'success',
        text1: 'Announcement sent!',
        text2: `Sent to: ${getRecipientMeta(recipientType).label}`,
      });

      setModalVisible(false);
      resetForm();
      fetchAnnouncements();
    } catch (err) {
      console.log('Send announcement error:', err?.message);
      Toast.show({
        type: 'error',
        text1: 'Failed to send',
        text2: err?.response?.data?.message || 'Please try again.',
      });
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setRecipientType('all_users');
    setRecipientEmail('');
  };

  const handleClose = () => {
    if (!sending) {
      setModalVisible(false);
      resetForm();
    }
  };

  // ── Render card ────────────────────────────────────────────────────────────
  const renderItem = ({ item }) => {
    const meta     = getRecipientMeta(item.recipientType);
    const border   = meta.color;

    return (
      <View style={[s.card, { borderLeftColor: border }]}>
        <View style={s.cardHeader}>
          <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
          <View style={[s.typeBadge, { backgroundColor: border + '22' }]}>
            <Text style={[s.typeLabel, { color: border }]}>{meta.label}</Text>
          </View>
        </View>

        <Text style={s.cardMessage}>{item.message}</Text>

        {/* Sender info row */}
        <View style={s.senderRow}>
          <View style={[s.roleTag, { backgroundColor: item.sentByRole === 'superadmin' ? theme.accent + '22' : theme.teal + '22' }]}>
            <Text style={[s.roleTagText, { color: item.sentByRole === 'superadmin' ? theme.accent : theme.teal }]}>
              {item.sentByRole === 'superadmin' ? 'Super Admin' : 'Admin'}
            </Text>
          </View>
          <Text style={s.senderName} numberOfLines={1}>
            {item.sentByName || 'Unknown'}
          </Text>
        </View>

        <View style={s.cardFooter}>
          <Text style={s.footerReads}>
            {item.readBy?.length || 0} read
          </Text>
          <Text style={s.footerDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  // ── Empty ──────────────────────────────────────────────────────────────────
  const EmptyState = () => (
    <View style={s.emptyContainer}>
      <Text style={s.emptyIcon}>📭</Text>
      <Text style={s.emptyTitle}>No announcements yet</Text>
      <Text style={s.emptySubtitle}>Tap the + button to send your first announcement.</Text>
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
        <Text style={s.headerTitle}>All Announcements</Text>
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
              {/* Modal Header */}
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Send Announcement</Text>
                <TouchableOpacity onPress={handleClose} disabled={sending}>
                  <Text style={s.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Recipient Type Chips */}
                <Text style={s.fieldLabel}>Send To</Text>
                <View style={s.chipRow}>
                  {RECIPIENT_TYPES.map((rt) => {
                    const active = recipientType === rt.key;
                    return (
                      <TouchableOpacity
                        key={rt.key}
                        style={[
                          s.chip,
                          active && { borderColor: rt.color, backgroundColor: rt.color + '22' },
                        ]}
                        onPress={() => setRecipientType(rt.key)}
                        disabled={sending}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            s.chipText,
                            active && { color: rt.color, fontWeight: '600' },
                          ]}
                        >
                          {rt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Individual email input */}
                {recipientType === 'individual' && (
                  <>
                    <Text style={s.fieldLabel}>Recipient Email</Text>
                    <TextInput
                      style={s.textInput}
                      placeholder="Enter recipient's email address"
                      placeholderTextColor={theme.textMuted}
                      value={recipientEmail}
                      onChangeText={setRecipientEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!sending}
                    />
                    {lookingUp && (
                      <View style={s.lookupRow}>
                        <ActivityIndicator size="small" color={theme.accent} />
                        <Text style={s.lookupText}>Looking up user...</Text>
                      </View>
                    )}
                  </>
                )}

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

                {/* Preview */}
                {(title.trim() || message.trim()) && (
                  <View style={[s.preview, { borderLeftColor: getRecipientMeta(recipientType).color }]}>
                    <Text style={s.previewLabel}>Preview</Text>
                    {title.trim() ? (
                      <Text style={s.previewTitle}>{title}</Text>
                    ) : null}
                    {message.trim() ? (
                      <Text style={s.previewMessage} numberOfLines={3}>{message}</Text>
                    ) : null}
                    <Text style={s.previewMeta}>
                      To: {getRecipientMeta(recipientType).label}
                      {recipientType === 'individual' && recipientEmail ? `  •  ${recipientEmail}` : ''}
                    </Text>
                  </View>
                )}

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
                    <Text style={s.sendBtnText}>
                      Send to {getRecipientMeta(recipientType).label}
                    </Text>
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
      marginBottom: 10,
    },
    senderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
    },
    roleTag: {
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    roleTagText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    senderName: {
      fontSize: 12,
      color: theme.textMuted,
      flex: 1,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: 10,
    },
    footerReads: {
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
      backgroundColor: theme.accent,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.accent,
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
      maxHeight: '92%',
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
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: theme.border,
      backgroundColor: theme.card,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.textSecondary,
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

    // ── Lookup indicator ──
    lookupRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: -10,
      marginBottom: 14,
    },
    lookupText: {
      fontSize: 13,
      color: theme.textMuted,
    },

    // ── Preview ──
    preview: {
      backgroundColor: theme.card,
      borderRadius: 12,
      borderLeftWidth: 4,
      padding: 14,
      marginBottom: 16,
    },
    previewLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 6,
    },
    previewTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: 4,
    },
    previewMessage: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 19,
      marginBottom: 8,
    },
    previewMeta: {
      fontSize: 11,
      color: theme.textMuted,
    },

    // ── Send button ──
    sendBtn: {
      backgroundColor: theme.accent,
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 4,
      shadowColor: theme.accent,
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
