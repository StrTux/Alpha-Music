import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * PlayerErrorHandler - A component to handle and display player errors
 * Provides user-friendly error messages and recovery options
 *
 * @param {Object} props - Component props
 * @param {Object} props.error - Error object with message and code
 * @param {Function} props.onRetry - Function to retry the operation
 * @param {Function} props.onReset - Function to reset the player
 * @param {Function} props.onDismiss - Optional function to dismiss the error
 * @returns {JSX.Element} - Error handler component
 */
const PlayerErrorHandler = ({error, onRetry, onReset, onDismiss}) => {
  // If no error, don't render anything
  if (!error) {
    return null;
  }

  // Get user-friendly error message based on error code or message
  const getErrorMessage = () => {
    if (!error) {
      return 'An unknown error occurred';
    }

    // Handle common error codes
    switch (error.code) {
      case 'ENOENT':
        return 'The audio file could not be found. It may have been moved or deleted.';
      case 'NETWORK_ERROR':
        return 'Network error. Please check your internet connection and try again.';
      case 'PLAYER_ERROR':
        return 'There was an error with the audio player. Please try again.';
      case 'PLAYBACK_ERROR':
        return 'Could not play this track. The file may be corrupted or in an unsupported format.';
      case 'AUTHORIZATION_ERROR':
        return 'You are not authorized to play this content.';
      case 'RATE_LIMIT_ERROR':
        return 'Too many requests. Please try again later.';
      default:
        // If we don't have a specific message for this error code, use the message or a fallback
        return error.message || 'An error occurred while playing the audio.';
    }
  };

  // Get suggested actions based on error type
  const getSuggestedAction = () => {
    if (!error) {
      return null;
    }

    switch (error.code) {
      case 'ENOENT':
        return 'Try another track';
      case 'NETWORK_ERROR':
        return 'Check your connection';
      case 'RATE_LIMIT_ERROR':
        return 'Wait a moment and try again';
      default:
        return 'Try again';
    }
  };

  return (
    <Animated.View style={styles.container}>
      <View style={styles.errorIcon}>
        <Icon name="alert-circle" size={24} color="#FF3B30" />
      </View>

      <View style={styles.errorContent}>
        <Text style={styles.errorTitle}>Playback Error</Text>
        <Text style={styles.errorMessage}>{getErrorMessage()}</Text>
      </View>

      <View style={styles.actionsContainer}>
        {onRetry && (
          <TouchableOpacity style={styles.actionButton} onPress={onRetry}>
            <Text style={styles.actionText}>{getSuggestedAction()}</Text>
          </TouchableOpacity>
        )}

        {onReset && (
          <TouchableOpacity style={styles.resetButton} onPress={onReset}>
            <Text style={styles.resetText}>Reset Player</Text>
          </TouchableOpacity>
        )}
      </View>

      {onDismiss && (
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Icon name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
    padding: 15,
    flexDirection: 'column',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  errorIcon: {
    marginRight: 10,
    padding: 5,
  },
  errorContent: {
    flex: 1,
    marginBottom: 10,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  errorMessage: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  actionButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  resetButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  resetText: {
    color: '#CCCCCC',
    fontWeight: '600',
    fontSize: 14,
  },
  dismissButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlayerErrorHandler;
