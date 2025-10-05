import { Router } from 'express';
import { inMemoryStore } from '../repositories/memoryStore';

export const marketsRouter: Router = Router();

marketsRouter.get('/', (req, res) => {
  const { category, search } = req.query;
  let markets = inMemoryStore.getMarkets();

  if (category && typeof category === 'string') {
    markets = markets.filter((market) => market.category.toLowerCase() === category.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const term = search.toLowerCase();
    markets = markets.filter(
      (market) =>
        market.title.toLowerCase().includes(term) ||
        market.slug.toLowerCase().includes(term) ||
        market.category.toLowerCase().includes(term)
    );
  }

  res.json({
    count: markets.length,
    items: markets
  });
});
