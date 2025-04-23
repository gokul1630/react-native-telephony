import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Switch, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleAlert as AlertCircle, Save, Info } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useSettings } from '@/hooks/useSettings';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';

export default function SettingsScreen() {
  const { settings, saveSettings } = useSettings();
  const [botToken, setBotToken] = useState(settings.telegramBotToken || '');
  const [chatId, setChatId] = useState(settings.telegramChatId || '');
  const [saveOnSend, setSaveOnSend] = useState(settings.saveOnSend !== false);
  const [isDarkMode, setIsDarkMode] = useState(settings.darkMode || false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Update local state when settings change
    setBotToken(settings.telegramBotToken || '');
    setChatId(settings.telegramChatId || '');
    setSaveOnSend(settings.saveOnSend !== false);
    setIsDarkMode(settings.darkMode || false);
  }, [settings]);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }]
    };
  });

  const handleButtonPress = () => {
    buttonScale.value = withSpring(0.95, { damping: 10 });
    setTimeout(() => {
      buttonScale.value = withSpring(1, { damping: 10 });
    }, 100);
  };

  const handleSave = async () => {
    setErrorMessage(null);
    
    if (!botToken.trim()) {
      setErrorMessage('Telegram Bot Token is required');
      return;
    }
    
    if (!chatId.trim()) {
      setErrorMessage('Telegram Chat ID is required');
      return;
    }
    
    try {
      handleButtonPress();
      setIsSaving(true);
      
      await saveSettings({
        telegramBotToken: botToken.trim(),
        telegramChatId: chatId.trim(),
        saveOnSend,
        darkMode: isDarkMode,
      });
      
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrorMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Settings</Text>
        
        {errorMessage && (
          <View style={styles.errorContainer}>
            <AlertCircle size={20} color={Colors.error} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Telegram Configuration</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bot Token</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Telegram bot token"
              placeholderTextColor={Colors.gray[400]}
              value={botToken}
              onChangeText={setBotToken}
              secureTextEntry={true}
            />
            <TouchableOpacity style={styles.infoButton} onPress={() => Alert.alert(
              'Bot Token',
              'Create a bot by messaging @BotFather on Telegram and following the instructions to get a bot token.'
            )}>
              <Info size={16} color={Colors.primary} />
              <Text style={styles.infoText}>How to get a bot token?</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Chat ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Telegram chat ID"
              placeholderTextColor={Colors.gray[400]}
              value={chatId}
              onChangeText={setChatId}
              keyboardType="number-pad"
            />
            <TouchableOpacity style={styles.infoButton} onPress={() => Alert.alert(
              'Chat ID',
              'Message @userinfobot on Telegram to get your chat ID. For group chats, use @RawDataBot.'
            )}>
              <Info size={16} color={Colors.primary} />
              <Text style={styles.infoText}>How to find your chat ID?</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          
          <View style={styles.preferenceItem}>
            <View>
              <Text style={styles.preferenceName}>Save messages in history</Text>
              <Text style={styles.preferenceDescription}>
                Keep a record of sent messages
              </Text>
            </View>
            <Switch
              value={saveOnSend}
              onValueChange={setSaveOnSend}
              trackColor={{ false: Colors.gray[300], true: Colors.primary }}
              thumbColor={Platform.OS === 'ios' ? Colors.white : saveOnSend ? Colors.secondary : Colors.gray[100]}
            />
          </View>
          
          <View style={styles.preferenceItem}>
            <View>
              <Text style={styles.preferenceName}>Dark Mode</Text>
              <Text style={styles.preferenceDescription}>
                Use dark theme (coming soon)
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: Colors.gray[300], true: Colors.primary }}
              thumbColor={Platform.OS === 'ios' ? Colors.white : isDarkMode ? Colors.secondary : Colors.gray[100]}
              disabled={true}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Save size={20} color={Colors.white} />
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.gray[900],
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '10',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.error,
    marginLeft: 8,
    flex: 1,
  },
  section: {
    marginBottom: 24,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.gray[800],
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.gray[700],
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.gray[800],
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 4,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  preferenceName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.gray[800],
  },
  preferenceDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.gray[500],
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.gray[400],
  },
  saveButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.white,
    marginLeft: 8,
  },
});