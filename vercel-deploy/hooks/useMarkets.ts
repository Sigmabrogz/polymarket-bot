'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useMarkets = () =>
  useQuery({
    queryKey: ['markets'],
    queryFn: () => api.getMarkets(),
    refetchInterval: 120_000
  });
