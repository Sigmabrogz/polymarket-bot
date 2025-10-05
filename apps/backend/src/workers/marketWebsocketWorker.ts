import WebSocket from 'ws';
import { appConfig } from '../config';
import { logger } from '../lib/logger';

export class MarketWebsocketWorker {
  private socket?: WebSocket;
  private reconnectTimeout?: NodeJS.Timeout;
  private subscriptions = new Set<string>();

  constructor(private readonly url = appConfig.clobWsBaseUrl) {}

  connect() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    logger.info({ url: this.url }, 'Connecting to Polymarket order book websocket');
    this.socket = new WebSocket(this.url);

    this.socket.on('open', () => {
      logger.info('Market websocket connected');
      this.subscriptions.forEach((tokenId) => this.subscribeToToken(tokenId));
    });

    this.socket.on('message', (data) => {
      try {
        const payload = JSON.parse(String(data));
        logger.debug({ payload }, 'Received websocket payload');
      } catch (error) {
        logger.error(error, 'Failed to parse websocket payload');
      }
    });

    this.socket.on('close', () => {
      logger.warn('Market websocket closed, scheduling reconnect');
      this.scheduleReconnect();
    });

    this.socket.on('error', (error) => {
      logger.error(error, 'Market websocket error');
      this.socket?.close();
    });
  }

  disconnect() {
    this.reconnectTimeout && clearTimeout(this.reconnectTimeout);
    this.socket?.close();
  }

  watchToken(tokenId: string) {
    this.subscriptions.add(tokenId);
    this.subscribeToToken(tokenId);
  }

  private subscribeToToken(tokenId: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const message = JSON.stringify({
      action: 'subscribe',
      channel: `market:${tokenId}`
    });

    this.socket.send(message);
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      return;
    }

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = undefined;
      this.connect();
    }, 5_000);
  }
}

export const marketWebsocketWorker = new MarketWebsocketWorker();
