import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

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
    case 'all_users':     return 'All Students';
    case 'broadcast_all': return 'Everyone';
    case 'admin_students':return 'Your Students';
    case 'individual':    return 'Direct';
    default:              return type;
  }
}

function borderColor(type, theme) {
  switch (type) {
    case 'all_users':     return theme.accent;
    case 'broadcast_all': return theme.teal;
    case 'admin_students':return theme.sage;
    case 'individual':    return theme.amber;
    default:              return theme.accent;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UserNotificationsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const s = styles(theme);

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  const userId = user?._id || user?.id;

  // ── Fetch & mark-read ──────────────────────────────────────────────────────
  const fetchAnnouncements = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/announcements/user/${userId}`);
      const list = res.data?.announcements || [];
      setAnnouncements(list);

      // Mark all unread ones as read in the background
      const unread = list.filter((a) => !a.isRead);
      unread.forEach((a) => {
        api.patch(`/announcements/${a._id}/read/${userId}`).catch(() => {});
      });
    } catch (err) {
      console.log('UserNotifications fetch error:', err?.message);
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    fetchAnnouncements().finally(() => setLoading(false));
  }, [fetchAnnouncements]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
  }, [fetchAnnouncements]);

  // ── Render item ────────────────────────────────────────────────────────────
  const renderItem = ({ item }) => {
    const border = borderColor(item.recipientType, theme);
    const isUnread = !item.isRead;

    return (
      <View style={[s.card, { borderLeftColor: border }, isUnread && s.cardUnread]}>
        {/* Unread dot */}
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
      <Text style={s.emptySubtitle}>Check back later for updates from your admin.</Text>
    </View>
  );

  // ── Loading state ──────────────────────────────────────────────────────────
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
      paddingBottom: 32,
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
  });
