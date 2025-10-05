import { appConfig } from '../config';
import { logger } from '../lib/logger';

class TelegramService {
  private readonly apiBase = 'https://api.telegram.org';

  async sendAlert(message: string) {
    if (!appConfig.telegramBotToken || !appConfig.telegramAlertChatId) {
      return;
    }

    const url = `${this.apiBase}/bot${appConfig.telegramBotToken}/sendMessage`;
    const payload = {
      chat_id: appConfig.telegramAlertChatId,
      text: message,
      parse_mode: 'MarkdownV2'
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const body = await res.text();
        logger.error({ status: res.status, body }, 'Failed to send Telegram alert');
      }
    } catch (error) {
      logger.error(error, 'Telegram alert error');
    }
  }
}

export const telegramService = new TelegramService();
