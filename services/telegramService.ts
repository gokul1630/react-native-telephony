import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_TELEGRAM_API_URL || 'https://api.telegram.org/bot';

export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string
): Promise<void> {
  try {
    const url = `${BASE_URL}${botToken}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    });

    if (!response.data.ok) {
      throw new Error(response.data.description || 'Failed to send message');
    }
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}