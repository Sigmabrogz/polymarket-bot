'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useFeed = (limit = 100) =>
  useQuery({
    queryKey: ['feed', limit],
    queryFn: () => api.getFeed(limit),
    refetchInterval: 5000
  });
