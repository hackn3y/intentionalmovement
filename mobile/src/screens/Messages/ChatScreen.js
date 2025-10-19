import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import { fetchMessages, sendMessage, markAsRead, setCurrentConversation } from '../../store/slices/messagesSlice';
import { messageSchema } from '../../utils/validation';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import { useTheme } from '../../context/ThemeContext';
import { formatters } from '../../utils/formatters';
import Input from '../../components/Input';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

const ChatScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { conversationId, userId } = route.params;
  const { messages, loading, currentConversation } = useSelector((state) => state.messages);
  const currentUser = useSelector((state) => state.auth.user);
  // Use userId as the key since that's what we use for fetchMessages
  const conversationMessages = messages[userId] || [];
  const styles = getStyles(colors);

  const MessageBubble = ({ message, isOwn }) => {
    return (
      <View style={[styles.messageBubble, isOwn ? styles.ownMessage : styles.otherMessage]}>
        <View style={[styles.messageContent, isOwn ? styles.ownContent : styles.otherContent]}>
          <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
            {message.content || message.text}
          </Text>
          {(message.createdAt || message.timestamp) && (
            <Text style={[styles.timestamp, isOwn ? styles.ownTimestamp : styles.otherTimestamp]}>
              {formatters.formatTime(message.createdAt || message.timestamp)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  useEffect(() => {
    if (conversationId && userId) {
      dispatch(setCurrentConversation({ _id: conversationId }));
      // The backend getMessages endpoint expects userId, not conversationId
      // It also automatically marks messages as read
      dispatch(fetchMessages({ conversationId: userId }));
    }
  }, [conversationId, userId]);

  // Reload messages when screen gains focus or when new message sent
  useEffect(() => {
    const loadMessages = () => {
      if (conversationId && userId) {
        dispatch(fetchMessages({ conversationId: userId }));
      }
    };

    const unsubscribe = navigation.addListener('focus', loadMessages);
    return unsubscribe;
  }, [navigation, conversationId, userId]);

  const handleSendMessage = async (values, { resetForm }) => {
    try {
      await dispatch(sendMessage({ conversationId, receiverId: userId, content: values.text })).unwrap();
      resetForm();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }) => {
    // Backend returns senderId as UUID string
    const senderId = item.senderId;
    const currentUserId = currentUser?.id || currentUser?._id;
    const isOwn = senderId === currentUserId;

    return <MessageBubble message={item} isOwn={isOwn} />;
  };

  if (loading && conversationMessages.length === 0) {
    return <LoadingSpinner text="Loading messages..." />;
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <FlatList
        data={conversationMessages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item._id || item.id || `message-${index}`}
        contentContainerStyle={styles.messagesList}
      />

      <Formik initialValues={{ text: '' }} validationSchema={messageSchema} onSubmit={handleSendMessage}>
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.inputContainer}>
            <Input placeholder="Type a message..." value={values.text} onChangeText={handleChange('text')} onBlur={handleBlur('text')} error={touched.text && errors.text} style={styles.input} />
            <Button title="Send" onPress={handleSubmit} disabled={!values.text.trim()} size="small" style={styles.sendButton} />
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.isDark ? '#000000' : '#f2f2f7' },
  messagesList: { padding: SIZES.md, paddingBottom: SIZES.xl },
  messageBubble: {
    marginBottom: SIZES.xs,
    marginHorizontal: SIZES.xs,
    flexDirection: 'row',
  },
  ownMessage: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  messageContent: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ownContent: {
    backgroundColor: colors.isDark ? '#0b93f6' : '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherContent: {
    backgroundColor: colors.isDark ? '#262626' : '#e5e5ea',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
  },
  ownText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: colors.isDark ? '#FFFFFF' : '#000000',
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: colors.isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.45)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: colors.isDark ? '#1c1c1e' : '#d1d1d6',
    alignItems: 'flex-end',
    gap: SIZES.sm,
    backgroundColor: colors.isDark ? '#000000' : '#ffffff',
  },
  input: { flex: 1, marginBottom: 0 },
  sendButton: { marginTop: 0, minWidth: 70 },
});

export default ChatScreen;
