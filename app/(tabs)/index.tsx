import Colors from '@/constants/Colors';
import { useSettings } from '@/hooks/useSettings';
import { useSmsPermission } from '@/hooks/useSmsPermission';
import { saveSentMessage } from '@/services/historyService';
import { sendTelegramMessage } from '@/services/telegramService';
import { CircleAlert as AlertCircle, Send } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MAX_MESSAGE_LENGTH = 2000;

export default function SendScreen() {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { hasSmsPermission, requestSmsPermission } = useSmsPermission();
    const { settings, loadSettings } = useSettings();
    const handleSend = async () => {
        setErrorMessage(null);
        if (!settings.telegramBotToken || !settings.telegramChatId) {
            loadSettings();
        }

        if (!message.trim()) {
            setErrorMessage('Please enter a message');
            return;
        }

        if (!settings.telegramBotToken) {
            setErrorMessage('Please set your Telegram Bot Token in Settings');
            return;
        }

        if (!settings.telegramChatId) {
            setErrorMessage('Please set your Telegram Chat ID in Settings');
            return;
        }

        if (Platform.OS !== 'android') {
            setErrorMessage('SMS functionality is only available on Android');
            return;
        }

        if (!hasSmsPermission) {
            const granted = await requestSmsPermission();
            if (!granted) {
                setErrorMessage('SMS permission is required to send messages');
                return;
            }
        }

        try {
            setIsSending(true);

            // Send message to Telegram
            await sendTelegramMessage(
                settings.telegramBotToken,
                settings.telegramChatId,
                message
            );

            // Save to history
            await saveSentMessage({
                id: Date.now().toString(),
                text: message,
                timestamp: new Date().toISOString(),
                status: 'sent',
            });

            // Success
            setMessage('');
            Alert.alert('Success', 'Message sent to Telegram successfully');
        } catch (error) {
            console.error('Error sending message:', error);
            setErrorMessage('Failed to send message. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    useEffect(() => {
        // Clear error message when message changes
        if (errorMessage) setErrorMessage(null);
    }, [message]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps='handled'>
                <View style={styles.header}>
                    <Text style={styles.title}>Send Message</Text>
                    <Text style={styles.subtitle}>
                        Send SMS from your device to Telegram
                    </Text>
                </View>

                {Platform.OS !== 'android' && (
                    <View style={styles.warningContainer}>
                        <AlertCircle size={20} color={Colors.warning} />
                        <Text style={styles.warningText}>
                            SMS functionality is only available on Android
                            devices
                        </Text>
                    </View>
                )}

                {errorMessage && (
                    <View style={styles.errorContainer}>
                        <AlertCircle size={20} color={Colors.error} />
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                )}

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.messageInput}
                        placeholder='Type your message here...'
                        placeholderTextColor={Colors.gray[400]}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        maxLength={MAX_MESSAGE_LENGTH}
                        textAlignVertical='top'
                    />
                    <Text style={styles.charCount}>
                        {message.length}/{MAX_MESSAGE_LENGTH}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        isSending && styles.sendButtonDisabled,
                    ]}
                    onPress={handleSend}
                    disabled={isSending || !message.trim()}>
                    <Send size={24} color={Colors.white} />
                    <Text style={styles.sendButtonText}>
                        {isSending ? 'Sending...' : 'Send to Telegram'}
                    </Text>
                </TouchableOpacity>
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
        flexGrow: 1,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontFamily: 'Inter-Bold',
        fontSize: 28,
        color: Colors.gray[900],
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: Colors.gray[500],
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.warning + '10',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    warningText: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: Colors.gray[700],
        marginLeft: 8,
        flex: 1,
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
    inputContainer: {
        marginBottom: 24,
    },
    messageInput: {
        height: 150,
        borderWidth: 1,
        borderColor: Colors.gray[300],
        borderRadius: 8,
        padding: 16,
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: Colors.gray[800],
        backgroundColor: Colors.white,
    },
    charCount: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: Colors.gray[500],
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    buttonContainer: {
        marginTop: 'auto',
        marginBottom: 16,
    },
    sendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    sendButtonDisabled: {
        backgroundColor: Colors.gray[400],
    },
    sendButtonText: {
        fontFamily: 'Inter-Medium',
        fontSize: 16,
        color: Colors.white,
        marginLeft: 8,
    },
});
