import { Router } from 'express';
import { testConnectivity } from '../lib/network';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

healthRouter.get('/network', async (_req, res) => {
  const targets = [
    'https://gamma-api.polymarket.com/markets?active=true&limit=1',
    'https://data-api.polymarket.com/trades?limit=1'
  ];
  
  try {
    const results = await testConnectivity(targets);
    const env = {
      https_proxy: !!process.env.HTTPS_PROXY,
      http_proxy: !!process.env.HTTP_PROXY,
      node: process.version,
      platform: process.platform
    };
    
    res.json({ 
      results, 
      env,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Network test failed', 
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});
