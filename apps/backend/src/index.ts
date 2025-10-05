import { buildApp } from './app';
import { appConfig } from './config';
import { ingestService } from './services/ingestService';
import { logger } from './lib/logger';
import { marketWebsocketWorker } from './workers/marketWebsocketWorker';
import { testConnectivity } from './lib/network';

const app = buildApp();

async function bootstrap() {
  try {
    // Start the HTTP server first so it's available even if data ingestion fails
    app.listen(appConfig.port, appConfig.host, () => {
      logger.info(`API listening on http://${appConfig.host}:${appConfig.port}`);
    });

    // Run network connectivity self-test
    logger.info('Running network connectivity self-test...');
    const targets = [
      'https://gamma-api.polymarket.com/markets?active=true&limit=1',
      'https://data-api.polymarket.com/trades?limit=1'
    ];
    
    const networkResults = await testConnectivity(targets);
    const failed = networkResults.filter(r => !r.ok);
    
    if (failed.length > 0) {
      logger.warn({ 
        failed: failed.map(f => ({ url: f.url, error: f.error, ms: f.ms }))
      }, 'Network connectivity issues detected');
      
      // Log specific diagnostics
      failed.forEach(f => {
        if (f.error?.includes('ETIMEDOUT')) {
          logger.warn(`Timeout to ${f.url} - check firewall/proxy settings`);
        } else if (f.error?.includes('ENOTFOUND')) {
          logger.warn(`DNS resolution failed for ${f.url} - check DNS settings`);
        } else if (f.error?.includes('ECONNREFUSED')) {
          logger.warn(`Connection refused to ${f.url} - check if service is down`);
        } else {
          logger.warn(`Network error to ${f.url}: ${f.error}`);
        }
      });
    } else {
      logger.info('Network connectivity test passed - all endpoints reachable');
    }

    // Attempt to start data ingestion (non-blocking on failure)
    try {
      await ingestService.start();
      marketWebsocketWorker.connect();
      logger.info('Data ingestion and websocket worker started successfully');
    } catch (error) {
      logger.warn(error, 'Failed to start data ingestion - server will run with empty data. Check network connectivity to Polymarket APIs.');
    }
  } catch (error) {
    logger.error(error, 'Failed to bootstrap backend');
    process.exitCode = 1;
  }
}

bootstrap();

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down');
  ingestService.stop();
  marketWebsocketWorker.disconnect();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down');
  ingestService.stop();
  marketWebsocketWorker.disconnect();
  process.exit(0);
});
