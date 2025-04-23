import * as SecureStore from 'expo-secure-store';
import { Message } from '@/types/message';

const HISTORY_KEY = 'message_history';

// Get all messages from history
export async function getMessageHistory(): Promise<Message[]> {
  try {
    const historyData = await SecureStore.getItemAsync(HISTORY_KEY);
    
    if (!historyData) {
      return [];
    }
    
    return JSON.parse(historyData);
  } catch (error) {
    console.error('Error getting message history:', error);
    return [];
  }
}

// Save a new message to history
export async function saveSentMessage(message: Message): Promise<void> {
  try {
    const history = await getMessageHistory();
    const updatedHistory = [message, ...history];
    
    await SecureStore.setItemAsync(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error saving message to history:', error);
    throw error;
  }
}

// Delete a specific message from history
export async function deleteMessage(messageId: string): Promise<void> {
  try {
    const history = await getMessageHistory();
    const updatedHistory = history.filter(message => message.id !== messageId);
    
    await SecureStore.setItemAsync(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error deleting message from history:', error);
    throw error;
  }
}

// Clear all message history
export async function clearMessageHistory(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing message history:', error);
    throw error;
  }
}