import api from '@/lib/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { User } from './types';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData: { email: string; password: string; fullname: string }) => {
      const { data } = await api.post('/auth/register', userData);
      return data;
    },
  });
};

// Add this function to your auth API service
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const { data } = await api.get<User>('/auth/me');
      return data;
    },
  });
};