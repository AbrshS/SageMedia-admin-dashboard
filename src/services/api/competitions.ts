import api from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Competition } from './types';

export const competitionKeys = {
  all: ['competitions'] as const,
  lists: () => [...competitionKeys.all, 'list'] as const,
  detail: (id: string) => [...competitionKeys.all, 'detail', id] as const,
};

export const useGetCompetitions = () => {
  return useQuery({
    queryKey: competitionKeys.lists(),
    queryFn: async () => {
      const { data } = await api.get<Competition[]>('/competitions');
      return data;
    },
  });
};

export const useCreateCompetition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (competition: Partial<Competition>) => {
      const { data } = await api.post('/competitions', competition);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: competitionKeys.lists() });
    },
  });
};

export const useUpdateCompetition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Competition> & { id: string }) => {
      const response = await api.put(`/competitions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: competitionKeys.lists() });
    },
  });
};

export const useDeleteCompetition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/competitions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: competitionKeys.lists() });
    },
  });
};