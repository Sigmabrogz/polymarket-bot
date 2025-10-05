import { Router } from 'express';
import { inMemoryStore } from '../repositories/memoryStore';

export const walletsRouter: Router = Router();

walletsRouter.get('/:address', (req, res) => {
  const address = req.params.address.toLowerCase();
  const stats = inMemoryStore.getWalletStats(address);
  const positions = inMemoryStore.getWalletPositions(address);
  const trades = inMemoryStore.getWalletTrades(address, 100);

  res.json({
    wallet: address,
    stats,
    positions,
    trades
  });
});

walletsRouter.get('/:address/positions', (req, res) => {
  const address = req.params.address.toLowerCase();
  const positions = inMemoryStore.getWalletPositions(address);
  res.json({ wallet: address, positions });
});
