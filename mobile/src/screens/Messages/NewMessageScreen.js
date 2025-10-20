import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { searchUsers } from '../../store/slices/userSlice';
import { COLORS, SIZES, FONT_SIZES } from '../../config/constants';
import { useTheme } from '../../context/ThemeContext';
import UserAvatar from '../../components/UserAvatar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

/**
 * New message screen - search and select a user to message
 */
const NewMessageScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors, isDarkMode } = useTheme();
  const { searchResults, loading } = useSelector((state) => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const styles = getStyles(colors, isDarkMode);

  // Debug logging
  console.log('[NewMessageScreen] isDarkMode:', isDarkMode);
  console.log('[NewMessageScreen] colors.text:', colors.text);
  console.log('[NewMessageScreen] colors.background:', colors.background);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        dispatch(searchUsers(searchQuery));
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, dispatch]);

  const handleUserSelect = (user) => {
    const userId = user.id || user._id;
    const userName = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;

    // Navigate to chat screen with the selected user
    navigation.navigate('Chat', {
      userId,
      userName,
    });
  };

  const renderUser = ({ item }) => {
    const userName = item.displayName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.username;

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleUserSelect(item)}
      >
        <UserAvatar
          uri={item.profileImage || item.profilePicture}
          firstName={item.displayName?.split(' ')[0] || item.firstName}
          lastName={item.displayName?.split(' ')[1] || item.lastName}
          size={50}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.username}>@{item.username}</Text>
          {item.bio && (
            <Text style={styles.userBio} numberOfLines={1}>
              {item.bio}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              color: isDarkMode ? '#ffffff' : '#111827',
              WebkitTextFillColor: isDarkMode ? '#ffffff' : '#111827',
            }
          ]}
          placeholder="Search users..."
          placeholderTextColor={colors.gray[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* User List */}
      {loading && searchQuery.trim().length > 0 ? (
        <LoadingSpinner text="Searching users..." />
      ) : searchQuery.trim().length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Search for Users"
          message="Enter a name or username to find people to message"
        />
      ) : searchResults.length === 0 ? (
        <EmptyState
          icon="🤷"
          title="No Users Found"
          message="Try searching with a different name or username"
        />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderUser}
          keyExtractor={(item) => item.id || item._id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const getStyles = (colors, isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchContainer: {
      padding: SIZES.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    searchInput: {
      height: 44,
      backgroundColor: isDarkMode ? colors.gray[800] : colors.gray[100],
      borderRadius: SIZES.sm,
      paddingHorizontal: SIZES.md,
      fontSize: FONT_SIZES.md,
    },
    listContainer: {
      paddingTop: SIZES.sm,
    },
    userItem: {
      flexDirection: 'row',
      padding: SIZES.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'center',
    },
    userInfo: {
      flex: 1,
      marginLeft: SIZES.md,
    },
    userName: {
      fontSize: FONT_SIZES.md,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    username: {
      fontSize: FONT_SIZES.sm,
      color: colors.gray[600],
      marginBottom: 2,
    },
    userBio: {
      fontSize: FONT_SIZES.sm,
      color: colors.gray[500],
      marginTop: 2,
    },
  });

export default NewMessageScreen;
