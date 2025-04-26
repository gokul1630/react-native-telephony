import { SETTINGS_KEY } from '@/hooks/useSettings';
import ExpoTelephony from 'expo-telephony';
import { saveSentMessage } from '@/services/historyService';
import { sendTelegramMessage } from '@/services/telegramService';
import * as SecureStore from 'expo-secure-store';
import BackgroundService from 'react-native-background-actions';

const options = {
	taskName: 'SMS Listener',
	taskTitle: 'Listening SMS & Calls',
	taskDesc: '',
	taskIcon: {
		name: 'ic_launcher',
		type: 'mipmap',
	},
	color: '#ff00ff',
	parameters: {
		delay: 1000,
	},
};

const sleep = (time: any) =>
	new Promise<void>((resolve) => setTimeout(() => resolve(), time));

const loadSettings = async () => {
	try {
		const storedSettings = await SecureStore.getItemAsync(SETTINGS_KEY);

		if (storedSettings) {
			return JSON.parse(storedSettings);
		}
	} catch (error) {
		console.error('Error loading settings:', error);
		return null;
	} finally {
	}
};

const setupBackgroundTasks = async () => {
	const settings = (await loadSettings()) as any;

	for (let i = 0; BackgroundService.isRunning(); i++) {
		await BackgroundService.updateNotification({
			taskDesc: 'Runned -> ' + i,
		});
		await sleep(1000);
	}
	ExpoTelephony.startListening();

	ExpoTelephony.addListener('onMissedCall', async (data) => {
		console.log(data)
		const text = `Missed call: ${data.phoneNumber}`;
		await sendTelegramMessage(
			settings?.telegramBotToken,
			settings?.telegramChatId,
			text
		);
	});
	ExpoTelephony.addListener('onReceiveSMS', async (message) => {
		console.log(message)
		const text = `sender: ${message.sender}\nText: ${message.body}`;
		await sendTelegramMessage(
			settings?.telegramBotToken,
			settings?.telegramChatId,
			text
		);

		await saveSentMessage({
			text,
			status: 'sent',
			id: Date.now().toString(),
			timestamp: new Date().toISOString(),
		});
	});
};


export const stopService = async () => await BackgroundService.stop()
export const isServiceRunning = BackgroundService.isRunning()
export const startService = async () => {
	const settings = await loadSettings() as any;
	if (settings?.telegramChatId && settings?.telegramBotToken) {
		await BackgroundService.start(setupBackgroundTasks, options)
	}
}