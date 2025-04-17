import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * ErrorBoundary - A component that catches JavaScript errors anywhere in its child component tree
 * and displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  // Static method that works like try/catch for rendering errors
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {hasError: true, error};
  }

  // Called when an error is caught
  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({errorInfo});

    // You can also log the error to an analytics service here
    // Example: logErrorToService(error, errorInfo);
  }

  // Reset the error state to allow recovery
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // If a reset callback was provided, call it
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    // If there's an error, render fallback UI
    if (this.state.hasError) {
      // If a custom fallback was provided, use it
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Otherwise, render the default error UI
      return (
        <View style={styles.container}>
          <View style={styles.errorIconContainer}>
            <Icon name="alert-circle" size={50} color="#FF3B30" />
          </View>

          <Text style={styles.errorTitle}>Something went wrong</Text>

          <Text style={styles.errorMessage}>
            {this.state.error?.message ||
              'The app encountered an unexpected error.'}
          </Text>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={this.handleReset}>
            <Text style={styles.resetText}>Try Again</Text>
          </TouchableOpacity>

          {this.props.showDetails && this.state.errorInfo && (
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>Error Details:</Text>
              <Text style={styles.detailsText}>
                {this.state.errorInfo.componentStack}
              </Text>
            </View>
          )}
        </View>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorIconContainer: {
    marginBottom: 20,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorMessage: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  resetText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  detailsContainer: {
    marginTop: 30,
    width: '100%',
    padding: 15,
    backgroundColor: '#111',
    borderRadius: 10,
  },
  detailsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;
