import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export interface AppSettings {
  telegramBotToken: string;
  telegramChatId: string;
  saveOnSend: boolean;
  darkMode: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  telegramBotToken: '',
  telegramChatId: '',
  saveOnSend: true,
  darkMode: false,
};

export const SETTINGS_KEY = 'app_settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on first mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await SecureStore.getItemAsync(SETTINGS_KEY);
      
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  return {
    settings,
    saveSettings,
    isLoading,
    loadSettings,
  };
}