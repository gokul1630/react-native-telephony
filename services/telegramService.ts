import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_TELEGRAM_API_URL || 'https://api.telegram.org/bot';

export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string
): Promise<void> {
  if (!botToken && !chatId) {
    return
  }

  try {
    const url = `${BASE_URL}${botToken}/sendMessage`;
    const response = await axios.get(url, {
      params: {
        chat_id: chatId,
        text: message,
      }
    });

    if (!response.data.ok) {
      throw new Error(response.data.description || 'Failed to send message');
    }
  } catch (error: any) {
    console.error('Error sending Telegram message:', error.message);
    throw error;
  }
}


export async function getChatId(
  botToken: string,
): Promise<string> {
  try {
    const url = `${BASE_URL}${botToken}/getUpdates`;
    const response = await axios.get(url)

    if (!response.data.ok) {
      throw new Error(response.data.description || 'Failed to fetch chatid');
    }
    return `${response.data?.result[0]?.message?.from?.id}` || ""
  } catch (error: any) {
    console.error('Error sending Telegram message:', error.message);
    throw error;
  }
}