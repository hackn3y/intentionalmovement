import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations } from '../../store/slices/messagesSlice';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import { useTheme } from '../../context/ThemeContext';
import { formatters } from '../../utils/formatters';
import UserAvatar from '../../components/UserAvatar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const ConversationsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { conversations, loading, unreadCount } = useSelector((state) => state.messages);
  const currentUser = useSelector((state) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const styles = getStyles(colors);

  useEffect(() => {
    dispatch(fetchConversations());
  }, []);

  // Reload conversations when screen gains focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      dispatch(fetchConversations());
    });

    return unsubscribe;
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchConversations());
    setTimeout(() => setRefreshing(false), 1000);
  }, [dispatch]);

  const handleConversationPress = (conversation) => {
    // Safety check for participants
    if (!conversation.participants || !Array.isArray(conversation.participants)) {
      console.warn('Conversation has no participants:', conversation);
      return;
    }

    const otherUser = conversation.participants.find(p => p._id !== currentUser?._id);
    if (!otherUser) {
      console.warn('Could not find other user in conversation');
      return;
    }

    navigation.navigate('Chat', { conversationId: conversation._id, userId: otherUser._id });
  };

  const handleNewMessage = () => {
    navigation.navigate('NewMessage');
  };

  const renderConversation = ({ item }) => {
    // Safety check for participants
    if (!item.participants || !Array.isArray(item.participants)) {
      return null;
    }

    const otherUser = item.participants.find(p => p._id !== currentUser?._id);
    const hasUnread = item.unreadCount > 0;

    // If no other user found, don't render
    if (!otherUser) {
      return null;
    }

    return (
      <TouchableOpacity style={styles.conversationItem} onPress={() => handleConversationPress(item)}>
        <UserAvatar uri={otherUser?.profilePicture} firstName={otherUser?.firstName} lastName={otherUser?.lastName} size={50} />

        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.userName, hasUnread && styles.unreadText]}>
              {otherUser?.firstName} {otherUser?.lastName}
            </Text>
            <Text style={styles.timestamp}>{formatters.formatMessageTime(item.updatedAt)}</Text>
          </View>
          <View style={styles.messagePreview}>
            <Text style={[styles.lastMessage, hasUnread && styles.unreadText]} numberOfLines={1}>
              {item.lastMessage?.text || 'No messages yet'}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && conversations.length === 0) {
    return <LoadingSpinner text="Loading conversations..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item, index) => item._id || item.id || `conversation-${index}`}
        ListEmptyComponent={<EmptyState icon="💬" title="No Messages" message="Start a conversation" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
        contentContainerStyle={conversations.length === 0 && styles.emptyContainer}
      />

      {/* Floating action button for new message */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleNewMessage}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>✉️</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  conversationItem: { flexDirection: 'row', padding: SIZES.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  conversationInfo: { flex: 1, marginLeft: SIZES.md },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.xs },
  userName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: colors.text },
  timestamp: { fontSize: FONT_SIZES.xs, color: colors.gray[500] },
  messagePreview: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMessage: { flex: 1, fontSize: FONT_SIZES.sm, color: colors.gray[600] },
  unreadText: { fontWeight: 'bold', color: colors.text },
  unreadBadge: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SIZES.xs },
  unreadBadgeText: { fontSize: FONT_SIZES.xs, color: colors.white, fontWeight: 'bold' },
  emptyContainer: { flex: 1 },
  fab: {
    position: 'absolute',
    right: SIZES.lg,
    bottom: SIZES.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabIcon: {
    fontSize: 24,
  },
});

export default ConversationsScreen;
