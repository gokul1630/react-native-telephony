import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { getMessageHistory, clearMessageHistory, deleteMessage } from '@/services/historyService';
import { Message } from '@/types/message';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

export default function HistoryScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const history = await getMessageHistory();
      setMessages(history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error('Failed to load message history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all message history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearMessageHistory();
              setMessages([]);
            } catch (error) {
              console.error('Failed to clear history:', error);
              Alert.alert('Error', 'Failed to clear message history');
            }
          },
        },
      ]
    );
  };

  const handleDeleteMessage = (id: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMessage(id);
              setMessages(messages.filter(msg => msg.id !== id));
            } catch (error) {
              console.error('Failed to delete message:', error);
              Alert.alert('Error', 'Failed to delete message');
            }
          },
        },
      ]
    );
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const date = new Date(item.timestamp);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    
    return (
      <Animated.View 
        layout={Layout.springify()}
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={styles.messageCard}
      >
        <View style={styles.messageHeader}>
          <View style={styles.statusContainer}>
            {item.status === 'sent' ? (
              <CheckCircle size={16} color={Colors.success} />
            ) : (
              <XCircle size={16} color={Colors.error} />
            )}
            <Text 
              style={[
                styles.statusText, 
                { color: item.status === 'sent' ? Colors.success : Colors.error }
              ]}
            >
              {item.status === 'sent' ? 'Sent' : 'Failed'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteMessage(item.id)}
            style={styles.deleteButton}
          >
            <Trash2 size={16} color={Colors.gray[500]} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.messageText} numberOfLines={3}>
          {item.text}
        </Text>
        
        <Text style={styles.timestamp}>{formattedDate}</Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Message History</Text>
        {messages.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory} style={styles.clearButton}>
            <Trash2 size={18} color={Colors.error} />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {isLoading ? 'Loading message history...' : 'No messages in history'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.gray[900],
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.error,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.gray[500],
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  messageCard: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginLeft: 4,
  },
  deleteButton: {
    padding: 4,
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.gray[800],
    marginBottom: 8,
  },
  timestamp: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.gray[500],
  },
});