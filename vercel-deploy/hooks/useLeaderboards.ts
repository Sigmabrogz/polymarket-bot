'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useLeaderboards = () =>
  useQuery({
    queryKey: ['leaderboards', 'default'],
    queryFn: () => api.getDefaultLeaderboards(),
    staleTime: 60_000
  });
