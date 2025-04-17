import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {resetPlayer, clearPlayerQueue} from '../../utils/resetPlayer';
import {runDiagnostics} from '../../utils/appDiagnostics';

const AudioSettings = ({navigation}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [errorLogs, setErrorLogs] = useState([]);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    loadErrorLogs();
  }, []);

  const loadErrorLogs = async () => {
    const logs = await getErrorLogs();
    setErrorLogs(logs);
  };

  const runAppDiagnostics = async () => {
    setIsLoading(true);
    try {
      const results = await runDiagnostics();
      setDiagnosticResults(results);
    } catch (error) {
      console.error('Error running diagnostics:', error);
      Alert.alert('Diagnostic Error', 'Failed to complete diagnostics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPlayer = async () => {
    setIsLoading(true);
    try {
      await resetPlayer();
      Alert.alert('Success', 'Player has been reset successfully');
    } catch (error) {
      console.error('Error resetting player:', error);
      Alert.alert('Error', 'Failed to reset player');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearQueue = async () => {
    setIsLoading(true);
    try {
      await clearPlayerQueue();
      Alert.alert('Success', 'Queue has been cleared');
    } catch (error) {
      console.error('Error clearing queue:', error);
      Alert.alert('Error', 'Failed to clear queue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearErrorLogs = async () => {
    setIsLoading(true);
    try {
      await clearErrorLogs();
      setErrorLogs([]);
      Alert.alert('Success', 'Error logs have been cleared');
    } catch (error) {
      console.error('Error clearing logs:', error);
      Alert.alert('Error', 'Failed to clear error logs');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOfflineMode = value => {
    setOfflineMode(value);
    // In a real app, you would implement offline mode logic here
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Audio Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1DB954" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Playback Settings</Text>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Offline Mode</Text>
                <Switch
                  value={offlineMode}
                  onValueChange={toggleOfflineMode}
                  trackColor={{false: '#767577', true: '#1DB954'}}
                  thumbColor="#f4f3f4"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Troubleshooting</Text>

              <TouchableOpacity
                style={styles.button}
                onPress={runAppDiagnostics}>
                <Text style={styles.buttonText}>Run Diagnostics</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={handleResetPlayer}>
                <Text style={styles.buttonText}>Reset Player</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={handleClearQueue}>
                <Text style={styles.buttonText}>Clear Queue</Text>
              </TouchableOpacity>
            </View>

            {diagnosticResults && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Diagnostic Results</Text>
                <Text style={styles.codeText}>
                  {JSON.stringify(diagnosticResults, null, 2)}
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Error Logs ({errorLogs.length})
              </Text>
              {errorLogs.length > 0 ? (
                <>
                  <ScrollView style={styles.logsContainer}>
                    {errorLogs.slice(0, 5).map((log, index) => (
                      <View key={index} style={styles.logItem}>
                        <Text style={styles.logTime}>
                          {new Date(log.timestamp).toLocaleString()}
                        </Text>
                        <Text style={styles.logSource}>{log.source}</Text>
                        <Text style={styles.logMessage}>{log.message}</Text>
                      </View>
                    ))}
                    {errorLogs.length > 5 && (
                      <Text style={styles.moreLogsText}>
                        + {errorLogs.length - 5} more logs...
                      </Text>
                    )}
                  </ScrollView>

                  <TouchableOpacity
                    style={[styles.button, styles.clearButton]}
                    onPress={handleClearErrorLogs}>
                    <Text style={styles.buttonText}>Clear Error Logs</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.emptyText}>No errors logged</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    backgroundColor: '#D32F2F',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  codeText: {
    color: '#1DB954',
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: '#121212',
    padding: 12,
    borderRadius: 4,
  },
  logsContainer: {
    maxHeight: 300,
  },
  logItem: {
    backgroundColor: '#121212',
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  logTime: {
    color: '#999999',
    fontSize: 12,
    marginBottom: 4,
  },
  logSource: {
    color: '#1DB954',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  logMessage: {
    color: '#FF4444',
    fontSize: 14,
  },
  moreLogsText: {
    color: '#999999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyText: {
    color: '#999999',
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
  },
});

export default AudioSettings;
