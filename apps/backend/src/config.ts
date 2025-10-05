import { config as loadEnv } from 'dotenv';
import { z } from 'zod';
import { DEFAULT_CONFIG } from '@polyburg/shared';

loadEnv();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  GAMMA_BASE_URL: z.string().url().default(DEFAULT_CONFIG.gammaBaseUrl),
  DATA_API_BASE_URL: z.string().url().default(DEFAULT_CONFIG.dataApiBaseUrl),
  CLOB_REST_BASE_URL: z.string().url().default(DEFAULT_CONFIG.clobRestBaseUrl),
  CLOB_WS_BASE_URL: z.string().url().default(DEFAULT_CONFIG.clobWsBaseUrl),
  POLL_INTERVAL_MS: z.coerce.number().positive().default(DEFAULT_CONFIG.pollIntervalMs),
  LEADERBOARD_WINDOWS: z
    .string()
    .default(DEFAULT_CONFIG.leaderboardWindowHours.join(',')),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_ALERT_CHAT_ID: z.string().optional()
});

const env = envSchema.parse(process.env);

export type AppConfig = {
  host: string;
  port: number;
  gammaBaseUrl: string;
  dataApiBaseUrl: string;
  clobRestBaseUrl: string;
  clobWsBaseUrl: string;
  pollIntervalMs: number;
  leaderboardWindowHours: number[];
  telegramBotToken?: string;
  telegramAlertChatId?: string;
};

export const appConfig: AppConfig = {
  host: env.HOST,
  port: env.PORT,
  gammaBaseUrl: env.GAMMA_BASE_URL,
  dataApiBaseUrl: env.DATA_API_BASE_URL,
  clobRestBaseUrl: env.CLOB_REST_BASE_URL,
  clobWsBaseUrl: env.CLOB_WS_BASE_URL,
  pollIntervalMs: env.POLL_INTERVAL_MS,
  leaderboardWindowHours: env.LEADERBOARD_WINDOWS.split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0),
  telegramBotToken: env.TELEGRAM_BOT_TOKEN,
  telegramAlertChatId: env.TELEGRAM_ALERT_CHAT_ID
};
