'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useWallet = (address?: string) =>
  useQuery({
    queryKey: ['wallet', address?.toLowerCase()],
    queryFn: async () => {
      if (!address) return null;
      return api.getWallet(address);
    },
    enabled: Boolean(address)
  });
